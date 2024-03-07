import { JwtAdapter, bcryptAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";


export class AuthService {

    //DI
    constructor(){}

    public async registerUser( registerUserDto: RegisterUserDto ){

        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if ( existUser ) throw CustomError.badRequest('Email already exist');

        try {

            const user = new UserModel(registerUserDto);
            
            // Encriptar la contrase;a
            user.password = bcryptAdapter.hash( registerUserDto.password );

            await user.save();
            // JWT <---- para mantener autenticacion del usuario
            // Email de confirmacion

            const { password, ...userEntity } = UserEntity.fromObject(user);

            return {
                user: userEntity,
                token: 'ABC',
            };
            
        } catch (error) {
            throw CustomError.internalServer(`${ error }`);
        }

    }

    public async loginUser( loginUserDto: LoginUserDto ) {

        // findOne para verificar si existe
        const user = await UserModel.findOne({ email: loginUserDto.email });
        if ( !user ) throw CustomError.badRequest('Email do not exist')

        
        // isMatch... bcrypt compare( 123456, hashed)
            
        const isMatch = bcryptAdapter.compare( loginUserDto.password, user.password )
        if ( !isMatch ) throw CustomError.badRequest('Email y/o contrase;a incorrecta')
        
        // const isMatch = bcryptAdapter.compare( loginUserDto.password, )
        const { password, ...userEntity } = UserEntity.fromObject(user);

        const token = await JwtAdapter.generateToken( { id: user.id });
        if ( !token ) throw CustomError.internalServer('Error while creating JWT')
        
        return {
            user: userEntity,
            token: token,
        }
        

    }


}