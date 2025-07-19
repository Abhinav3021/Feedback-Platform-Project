import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  type: 'text' | 'multiple-choice';
  question: string;
  options?: string[];
  required: boolean;
}

export interface IForm extends Document {
  title: string;
  description?: string;
  questions: IQuestion[];
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'multiple-choice'],
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    type: String,
    trim: true,
  }],
  required: {
    type: Boolean,
    default: true,
  },
});

const formSchema = new Schema<IForm>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(questions: IQuestion[]) {
        return questions.length >= 3 && questions.length <= 5;
      },
      message: 'A form must have between 3 and 5 questions',
    },
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Form: Model<IForm> = mongoose.models.Form || mongoose.model<IForm>('Form', formSchema);

export default Form;
