import type { ApiClient } from "./client.js";
import type {
  LoginData,
  CreateUserData,
  EmailVerificationData,
  CreateRecipeData,
  UpdateRecipeData,
  UpdateProfileData,
  ChatMessageData,
  GenerateRecipeData,
  UsageStatsData,
} from "../utils/schemas.js";
import type {
  AuthResponse,
  RecipeResponse,
  RecipeListResponse,
  ChatResponse,
  UsageStatsResponse,
  UploadResponse,
} from "../types/index.js";
import { API_ENDPOINTS } from "../constants/index.js";

// Authentication service
export class AuthService {
  constructor(private client: ApiClient) {}

  async login(data: LoginData): Promise<AuthResponse> {
    return this.client.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
  }

  async register(data: CreateUserData): Promise<AuthResponse> {
    return this.client.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  async logout(): Promise<void> {
    return this.client.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async getCurrentUser(): Promise<AuthResponse["user"]> {
    return this.client.get<AuthResponse["user"]>(API_ENDPOINTS.AUTH.USER);
  }

  async verifyEmail(data: EmailVerificationData): Promise<{ message: string }> {
    return this.client.post<{ message: string }>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      data
    );
  }
}

// Recipe service
export class RecipeService {
  constructor(private client: ApiClient) {}

  async getRecipes(page = 1, limit = 10): Promise<RecipeListResponse> {
    return this.client.get<RecipeListResponse>(
      `${API_ENDPOINTS.RECIPES.LIST}?page=${page}&limit=${limit}`
    );
  }

  async getRecipe(id: number): Promise<RecipeResponse> {
    return this.client.get<RecipeResponse>(API_ENDPOINTS.RECIPES.GET(id));
  }

  async createRecipe(data: CreateRecipeData): Promise<RecipeResponse> {
    return this.client.post<RecipeResponse>(API_ENDPOINTS.RECIPES.CREATE, data);
  }

  async updateRecipe(id: number, data: UpdateRecipeData): Promise<RecipeResponse> {
    return this.client.patch<RecipeResponse>(API_ENDPOINTS.RECIPES.UPDATE(id), data);
  }

  async deleteRecipe(id: number): Promise<void> {
    return this.client.delete<void>(API_ENDPOINTS.RECIPES.DELETE(id));
  }

  async generateRecipe(data: GenerateRecipeData): Promise<RecipeResponse> {
    return this.client.post<RecipeResponse>(API_ENDPOINTS.RECIPES.GENERATE, data);
  }
}

// Chat service
export class ChatService {
  constructor(private client: ApiClient) {}

  async sendMessage(data: ChatMessageData): Promise<ChatResponse> {
    return this.client.post<ChatResponse>(API_ENDPOINTS.CHAT.MESSAGE, data);
  }

  async getConversations(): Promise<{ id: string; lastMessage: string; updatedAt: string }[]> {
    return this.client.get(API_ENDPOINTS.CHAT.CONVERSATIONS);
  }

  async getConversation(id: string): Promise<{
    id: string;
    messages: Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>;
  }> {
    return this.client.get(API_ENDPOINTS.CHAT.CONVERSATION(id));
  }
}

// User service
export class UserService {
  constructor(private client: ApiClient) {}

  async updateProfile(data: UpdateProfileData): Promise<AuthResponse["user"]> {
    return this.client.patch<AuthResponse["user"]>(
      API_ENDPOINTS.USER.PROFILE,
      data
    );
  }

  async uploadPhoto(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("photo", file);

    return this.client.post<UploadResponse>(
      API_ENDPOINTS.USER.UPLOAD_PHOTO,
      formData,
      {
        headers: {
          // Don't set Content-Type, let the browser set it for FormData
        },
      }
    );
  }

  async deleteAccount(): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(API_ENDPOINTS.USER.DELETE_ACCOUNT);
  }
}

// Usage service
export class UsageService {
  constructor(private client: ApiClient) {}

  async getStats(data?: UsageStatsData): Promise<UsageStatsResponse> {
    const query = data ? `?month=${data.month}` : "";
    return this.client.get<UsageStatsResponse>(`${API_ENDPOINTS.USAGE.STATS}${query}`);
  }

  async getHistory(): Promise<Array<{
    month: string;
    recipeQueries: number;
    recipesGenerated: number;
  }>> {
    return this.client.get(API_ENDPOINTS.USAGE.HISTORY);
  }
}

// Combined service class
export class FlavorBotApi {
  public auth: AuthService;
  public recipes: RecipeService;
  public chat: ChatService;
  public user: UserService;
  public usage: UsageService;

  constructor(private client: ApiClient) {
    this.auth = new AuthService(client);
    this.recipes = new RecipeService(client);
    this.chat = new ChatService(client);
    this.user = new UserService(client);
    this.usage = new UsageService(client);
  }

  // Direct access to client for custom requests
  get apiClient(): ApiClient {
    return this.client;
  }
}