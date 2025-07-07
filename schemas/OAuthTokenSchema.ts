import mongoose, { Schema, Document } from 'mongoose';

export interface IOAuthToken extends Document {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
  createdAt: Date;
}

const OAuthTokenSchema = new Schema<IOAuthToken>({
  access_token: { type: String, required: true },
  refresh_token: { type: String, required: true },
  scope: { type: String, required: true },
  token_type: { type: String, required: true },
  expiry_date: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.OAuthToken ||
  mongoose.model<IOAuthToken>('OAuthToken', OAuthTokenSchema);
