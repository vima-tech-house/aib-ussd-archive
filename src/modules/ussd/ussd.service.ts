import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Transaction } from 'sequelize';
import { UssdState } from '@/interfaces/ussd-states.enum';
import { UssdSession } from '@database/models/ussd-session.model';
import { User } from '@database/models/user.model';

@Injectable()
export class UssdService {
  constructor(
    @InjectModel(UssdSession)
    private ussdSessionModel: typeof UssdSession,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  private async getOrCreateSession(
    sessionId: string,
    phoneNumber: string,
  ): Promise<UssdSession> {
    const session = await this.ussdSessionModel.findOne({
      where: { session_id: sessionId },
    });

    if (!session) {
      // Use build and save pattern which handles types better
      const newSession = this.ussdSessionModel.build({
        session_id: sessionId,
        phone_number: phoneNumber,
        state: UssdState.INITIAL,
        data: {},
      });
      return newSession.save();
    }

    return session;
  }

  async handleUssdRequest(
    sessionId: string,
    phoneNumber: string,
    text: string,
  ): Promise<string> {
    const session = await this.getOrCreateSession(sessionId, phoneNumber);
    const textArray = text.split('*');
    const lastInput = textArray[textArray.length - 1];

    try {
      switch (session.state) {
        case UssdState.INITIAL:
          return this.handleInitialState(session, lastInput);
        case UssdState.SIGNUP_FIRST_NAME:
          return this.handleSignupFirstName(session, lastInput);
        case UssdState.SIGNUP_LAST_NAME:
          return this.handleSignupLastName(session, lastInput);
        case UssdState.SIGNUP_ID_NUMBER:
          return this.handleSignupIdNumber(session, lastInput);
        case UssdState.SIGNUP_PIN:
          return this.handleSignupPin(session, lastInput);
        case UssdState.SIGNUP_CONFIRM_PIN:
          return this.handleSignupConfirmPin(session, lastInput);
        case UssdState.LOGIN_PIN:
          return this.handleLoginPin(session, lastInput);
        default:
          return this.handleInitialState(session, lastInput);
      }
    } catch (error) {
      await session.destroy();
      return 'END An error occurred. Please try again.';
    }
  }

  private async handleInitialState(
    session: UssdSession,
    input: string,
  ): Promise<string> {
    if (!input) {
      return 'CON Welcome to Our Service\n1. Sign up\n2. Login';
    }

    switch (input) {
      case '1':
        await session.update({ state: UssdState.SIGNUP_FIRST_NAME });
        return 'CON Enter your first name:';
      case '2':
        const user = await this.userModel.findOne({
          where: { phone_number: session.phone_number },
        });
        if (!user) {
          return 'END User not found. Please sign up first.';
        }
        await session.update({ state: UssdState.LOGIN_PIN });
        return 'CON Enter your PIN:';
      default:
        return 'END Invalid option. Please try again.';
    }
  }

  private async handleSignupFirstName(
    session: UssdSession,
    firstName: string,
  ): Promise<string> {
    if (firstName.length < 2) {
      return 'CON First name too short. Please enter your first name:';
    }

    await session.update({
      state: UssdState.SIGNUP_LAST_NAME,
      data: { ...session.data, firstName },
    });

    return 'CON Enter your last name:';
  }

  private async handleSignupLastName(
    session: UssdSession,
    lastName: string,
  ): Promise<string> {
    if (lastName.length < 2) {
      return 'CON Last name too short. Please enter your last name:';
    }

    await session.update({
      state: UssdState.SIGNUP_ID_NUMBER,
      data: { ...session.data, lastName },
    });

    return 'CON Enter your ID/Passport number:';
  }

  private async handleSignupIdNumber(
    session: UssdSession,
    idNumber: string,
  ): Promise<string> {
    if (idNumber.length < 5) {
      return 'CON Invalid ID/Passport number. Please try again:';
    }

    await session.update({
      state: UssdState.SIGNUP_PIN,
      data: { ...session.data, idNumber },
    });

    return 'CON Create a 4-digit PIN:';
  }

  private async handleSignupPin(
    session: UssdSession,
    pin: string,
  ): Promise<string> {
    if (!/^\d{4}$/.test(pin)) {
      return 'CON Invalid PIN. Please enter exactly 4 digits:';
    }

    await session.update({
      state: UssdState.SIGNUP_CONFIRM_PIN,
      data: { ...session.data, pin },
    });

    return 'CON Confirm your PIN:';
  }

  private async handleSignupConfirmPin(
    session: UssdSession,
    confirmPin: string,
  ): Promise<string> {
    if (session.data.pin !== confirmPin) {
      return 'CON PINs do not match. Please enter your PIN again:';
    }

    // Handle the sequelize property possibly being undefined
    const sequelize = this.ussdSessionModel.sequelize;
    if (!sequelize) {
      await session.destroy();
      return 'END An error occurred. Please try again.';
    }

    const t = await sequelize.transaction();

    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        where: { phone_number: session.phone_number },
        transaction: t,
      });

      if (existingUser) {
        await t.rollback();
        await session.destroy();
        return 'END A user with this phone number already exists.';
      }

      const hashedPin = await bcrypt.hash(confirmPin, 10);

      // Create new user with build and save pattern
      const newUser = this.userModel.build({
        first_name: session.data.firstName,
        last_name: session.data.lastName,
        phone_number: session.phone_number,
        password: hashedPin,
        role: 'CLIENT',
        email: `${session.phone_number}@placeholder.com`, // Temporary email
        is_verified: true, // Auto-verify USSD users
        client_type: 'individual',
        is_active: true,
        is_client: true,
      });

      await newUser.save({ transaction: t });
      await t.commit();
      await session.destroy();

      return 'END Registration successful! You can now login with your PIN.';
    } catch (error) {
      await t.rollback();
      await session.destroy();
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  private async handleLoginPin(
    session: UssdSession,
    pin: string,
  ): Promise<string> {
    if (!/^\d{4}$/.test(pin)) {
      return 'CON Invalid PIN format. Please enter your 4-digit PIN:';
    }

    const user = await this.userModel.findOne({
      where: { phone_number: session.phone_number },
    });

    if (!user) {
      await session.destroy();
      return 'END User not found. Please sign up first.';
    }

    const isValidPin = await bcrypt.compare(pin, user.password);
    if (!isValidPin) {
      await session.destroy();
      return 'END Invalid PIN. Please try again.';
    }

    await session.destroy();
    return `END Welcome back, ${user.first_name}!`;
  }
}
