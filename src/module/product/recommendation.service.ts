import { GoogleGenerativeAI } from "@google/generative-ai";
import { Service } from "typedi";
import dotenv from "dotenv";

dotenv.config();

@Service()
export class RecommendationService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || "";
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Sử dụng model embedding-001 để đảm bảo tính ổn định và khả dụng cao nhất
        this.model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    }

    /**
     * Chuyển đổi văn bản thành Vector Embedding (768 chiều)
     */
    async getEmbedding(text: string): Promise<number[]> {
        try {
            if (!text || text.trim() === "") return [];

            const result = await this.model.embedContent(text);
            const embedding = result.embedding;
            return embedding.values;
        } catch (error) {
            console.error("❌ Error generating embedding:", error);
            return [];
        }
    }

    /**
     * Tính toán độ tương đồng Cosine giữa 2 vector
     * Kết quả từ -1 đến 1 (càng gần 1 càng giống nhau)
     */
    cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
        if (vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Tìm các sản phẩm tương đồng nhất từ 1 danh sách
     */
    findTopSimilar(sourceEmbedding: number[], products: any[], limit: number = 5): any[] {
        if (!sourceEmbedding || sourceEmbedding.length === 0) return [];

        const similarityList = products
            .filter(p => p.embedding && p.embedding.length > 0)
            .map(p => ({
                product: p,
                similarity: this.cosineSimilarity(sourceEmbedding, p.embedding)
            }))
            .sort((a, b) => b.similarity - a.similarity);

        return similarityList.slice(0, limit).map(item => item.product);
    }
}
