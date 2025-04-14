import mongoose, { Schema, Document, Model } from "mongoose";

// Topic Schema with Static Methods
export interface ITopic extends Document {
  title: string;
  company: string;
  content: string;
  images?: string[];
  tags?: string[];

  createdBy: {
    userId: mongoose.Types.ObjectId | string;
    name: string;
    email?: string;
  };

  likes: {
    count: number;
    users: (mongoose.Types.ObjectId | string)[];
  };

  isLikedByUser(userId: string): boolean;

  commentsCount: number;
  isActive: boolean;
  isPinned?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicModel extends Model<ITopic> {
  toggleLike(topicId: string, userId: string): Promise<{ success: boolean; message: string; liked: boolean }>;
  getComments(topicId: string, limit?: number, skip?: number): Promise<any>;
  countComments(topicId: string): Promise<number>;
}

const topicSchema = new Schema<ITopic>(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    createdBy: {
      userId: { type: Schema.Types.ObjectId, required: true, ref: "Student" },
      name: { type: String, required: true },
      email: { type: String },
    },
    likes: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Virtual for comments
topicSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'topicId',
  options: { sort: { createdAt: -1 } },
});

// Instance method
topicSchema.methods.isLikedByUser = function(userId: string) {
  if (!userId) return false;
  return this.likes.users.some(
    (id: mongoose.Types.ObjectId | string) => id.toString() === userId.toString()
  );
};

// Static: toggle like
topicSchema.statics.toggleLike = async function (topicId: string, userId: string) {
  const topic = await this.findById(topicId);
  if (!topic) return { success: false, message: "Topic not found", liked: false };

  const alreadyLiked = topic.likes.users.some(
    (id: mongoose.Types.ObjectId | string) => id.toString() === userId
  );

  let updateOperation;
  let resultMessage;
  let liked;

  if (alreadyLiked) {
    updateOperation = {
      $pull: { "likes.users": userId },
      $inc: { "likes.count": -1 }
    };
    resultMessage = "Like removed";
    liked = false;
  } else {
    updateOperation = {
      $addToSet: { "likes.users": userId },
      $inc: { "likes.count": 1 }
    };
    resultMessage = "Liked successfully";
    liked = true;
  }

  await this.findByIdAndUpdate(topicId, updateOperation);
  return { success: true, message: resultMessage, liked };
};

// Static: get comments
topicSchema.statics.getComments = async function(topicId: string, limit = 10, skip = 0) {
  const topic = await this.findById(topicId);
  if (!topic) return null;

  const comments = await mongoose.model('Comment').find({
    topicId,
    parentId: { $exists: false },
    isActive: true
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const topicObj = topic.toObject();
  delete topicObj.likes.users;

  return {
    ...topicObj,
    comments
  };
};

// Static: count comments
topicSchema.statics.countComments = async function(topicId: string) {
  return mongoose.model('Comment').countDocuments({
    topicId,
    isActive: true
  });
};

// Compile model AFTER statics are defined
export const Topic: ITopicModel =
  (mongoose.models.Topic as ITopicModel) || mongoose.model<ITopic, ITopicModel>("Topic", topicSchema);

// Comment Schema
export interface IComment extends Document {
  topicId: mongoose.Types.ObjectId | string;
  content: string;
  createdBy: {
    userId: mongoose.Types.ObjectId | string;
    name: string;
    email?: string;
  };
  parentId?: mongoose.Types.ObjectId | string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Topic",
      index: true,
    },
    content: { type: String, required: true },
    createdBy: {
      userId: { type: Schema.Types.ObjectId, required: true, ref: "Student" },
      name: { type: String, required: true },
      email: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to update comment count
commentSchema.pre("save", async function (next) {
  if (this.isNew) {
    await mongoose
      .model("Topic")
      .updateOne({ _id: this.topicId }, { $inc: { commentsCount: 1 } });
  }
  next();
});

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
