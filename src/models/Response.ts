import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAnswer {
  questionId: string;
  answer: string;
}

export interface IResponse extends Document {
  formId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const answerSchema = new Schema<IAnswer>({
  questionId: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
});

const responseSchema = new Schema<IResponse>({
  formId: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
  },
  answers: {
    type: [answerSchema],
    required: true,
    validate: {
      validator: function(answers: IAnswer[]) {
        return answers.length > 0;
      },
      message: 'Response must have at least one answer',
    },
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

const Response: Model<IResponse> = mongoose.models.Response || mongoose.model<IResponse>('Response', responseSchema);

export default Response;
