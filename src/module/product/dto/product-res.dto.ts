import { Expose, plainToInstance, Type } from "class-transformer";
import { IProduct } from "../model/product.model";
import { ProductType } from "../product.type";

export class ProductResDTO {
    @Expose()
    _id : string;
    @Expose()
    name: string;

    @Expose()
    categoryName: string;

    @Expose()
    price: number;

    @Expose()
    totalReview: number;

    @Expose()
    rating: number;

    static fromEntity(data: IProduct) {
        const plainData = data.toObject(); // Chuyển đổi đối tượng Mongoose thành đối tượng thuần JavaScript
        return plainToInstance(
            ProductResDTO,
            {...plainData, categoryName: data.categoryId?.name || null },
            { excludeExtraneousValues: true }
        );
    }
}


