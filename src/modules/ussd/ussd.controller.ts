import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UssdService } from './ussd.service';
import { UssdRequestDto } from '@/common/dtos/ussd-request.dto';

@ApiTags('USSD')
@Controller('ussd')
export class UssdController {
  constructor(private readonly ussdService: UssdService) {}

  @Post()
  @ApiOperation({ summary: "Handle USSD requests from Africa's Talking" })
  @ApiResponse({
    status: 200,
    description: 'USSD response that will be shown to the user',
    type: String,
  })
  async handleUssd(@Body() ussdRequest: UssdRequestDto): Promise<string> {
    return this.ussdService.handleUssdRequest(
      ussdRequest.sessionId,
      ussdRequest.phoneNumber,
      ussdRequest.text,
    );
  }
}
