import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  // Relative Location keeps the redirect correct both at `/` and behind
  // a path-based reverse proxy such as `/cutaway/`.
  @Get()
  @Redirect('graphql', 302)
  redirectToSandbox(): void {}
}
