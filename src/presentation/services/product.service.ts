import { ProductModel } from "../../data";
import { CustomError, PaginationDto } from "../../domain";
import { CreateProductsDto } from '../../domain/dtos/products/create-product.dto';
import path from 'path';


export class ProductService {

    // DI
    constructor() {}


    async CreateProduct( createProductDto: CreateProductsDto ) {

        const productExist = await ProductModel.findOne({ name: createProductDto.name })
        if ( productExist ) throw CustomError.badRequest( 'Product already exist' );

        try {
            
            const product = new ProductModel( createProductDto );

            await product.save();

            return product;

        } catch (error) {
            
            throw CustomError.internalServer(`${ error }`)

        }

    }

    async getProducts( paginationDto: PaginationDto) {

        const { page, limit } = paginationDto;

        try {

            const [ total, products ] = await Promise.all([
                ProductModel.countDocuments(),
                await ProductModel.find()
                    .skip( (page - 1) * limit )
                    .limit( limit )
                    .populate( 'user')
                    .populate('category')

            ])

            return {
                page: page,
                limit: limit,
                total: total,
                next: `/api/products?page=${ (page + 1) }%limit=${ limit }`,
                prev:  ( page - 1 > 0) ? `/api/products?page=${ (page - 1) }%limit=${ limit }`: null,


                products: products,
            }

        } catch (error) {
            
            throw CustomError.internalServer(`${ error }`)

        }


        // ( (),(),() ) id, name, available
    }

}