import {
  IsString, IsEmail, Length, IsUrl
} from 'class-validator';

class SignupRequestBody {
    @IsEmail()
    email

    @IsString()
    @Length(4, 20)
    name;

    @IsString()
    password;

    @IsUrl()
    profileImage;
}

export default SignupRequestBody;
