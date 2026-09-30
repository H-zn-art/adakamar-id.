import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  REQUEST_REVISION = 'REQUEST_REVISION',
}

export class ReviewArticleDto {
  @IsOptional()
  @IsEnum(ReviewAction)
  action?: ReviewAction;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  revisionNotes?: string;
}
