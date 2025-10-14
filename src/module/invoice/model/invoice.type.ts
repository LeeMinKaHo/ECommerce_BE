export interface InvoiceRequestItem {
   productId: string;
   variantId: string;
   name: string;
   size: string;
   color: string;
   imageUrl: string;
   price: number;
   quantity: number;
}

export interface InvoiceRequest {
   userId: string;
   shippingInfo?: {
      name: string;
      address: string;
      phone: string;
   };
   items: InvoiceRequestItem[];
}
