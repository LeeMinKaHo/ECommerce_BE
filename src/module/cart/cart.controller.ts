import { NextFunction, Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import { Inject, Service } from "typedi";
import { CartService } from "./cart.service";
import { ResponseCustom } from "../shared/response-custom";
import { AddCartDTO } from "./dto/add-cart.dto";
import { CartResDTO } from "./dto/cart-res.dto";
@Service()
export class CartController {
    constructor(@Inject() private cartService : CartService) {}
    async addToCart(req : AuthRequest, res : Response , next : NextFunction) {
        try {
            
            const {email} = req.payload;
            const data = await this.cartService.addToCart(email, AddCartDTO.fromRequest(req.body));
            // Logic to add product to cart
            res.status(200).json(new ResponseCustom(data, null, null)); 
        } catch (error) {
            next(error);
        }
    }
    async getCart(req : AuthRequest, res : Response , next : NextFunction) {
        try {
            const {email} = req.payload;
            const data = await this.cartService.getCart(email);
            res.status(200).json(new ResponseCustom(data.map(CartResDTO.fromEntity), null, null)); 
        } catch (error) {
            next(error);
        }
    }
    async removeCartItem(req : AuthRequest, res : Response , next : NextFunction) {
        const {email} = req.payload;
        const cartId = req.params.cartId;
        try {
            const data = await this.cartService.removeCartItem(email, cartId);
            res.status(200).json(new ResponseCustom(data, null, null)); 
        }
        catch (error) {
            next(error);
        }
    }
}