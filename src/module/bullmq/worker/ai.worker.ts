import { Worker } from "bullmq";
import Container from "typedi";
import { connectionRedis } from "../../shared/database/mongodb";
import { queueName } from "../../shared/queue/bullmq.share";
import productModel from "../../product/model/product.model";
import { RecommendationService } from "../../product/recommendation.service";

// Ở đây chúng ta không sử dụng inject trực tiếp vì Worker chạy ở context riêng
// Nhưng chúng ta có thể dùng Container.get
const recommendationService = Container.get(RecommendationService);

export const aiWorker = new Worker(
    queueName.ai,
    async (job) => {
        const { productId } = job.data;
        console.log(`🤖 AI Processing: Generating embedding for product ${productId}`);

        try {
            const product = await productModel.findById(productId);
            if (!product) {
                console.error(`❌ Product ${productId} not found`);
                return;
            }

            // Gộp thông tin để tạo ngữ cảnh cho AI
            const textToEmbed = `${product.name}. ${product.description}. Category: ${product.categoryName || ""}`;
            
            console.log(`🧠 Calling AI to embed text for: ${product.name}`);
            const embedding = await recommendationService.getEmbedding(textToEmbed);

            if (embedding && embedding.length > 0) {
                await productModel.findByIdAndUpdate(productId, { embedding });
                console.log(`✅ AI: Successfully updated embedding for ${product.name}`);
            } else {
                console.error(`❌ AI: Failed to generate embedding for ${product.name}`);
            }
        } catch (error) {
            console.error(`❌ AI Worker Error for product ${productId}:`, error);
        }
    },
    { connection: connectionRedis }
);
