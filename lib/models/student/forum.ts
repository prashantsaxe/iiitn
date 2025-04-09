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

  // Voting
  upvotes: {
    count: number;
    users: (mongoose.Types.ObjectId | string)[];
  };
  downvotes: {
    count: number;
    users: (mongoose.Types.ObjectId | string)[];
  };
  getUserVoteStatus(userId: string): 'upvoted' | 'downvoted' | 'none';
  netVotes: number; // Virtual property
  commentsCount: number;
  isActive: boolean;
  isPinned?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Extend the ITopic interface to include static methods
export interface ITopicModel extends Model<ITopic> {
  upvote(topicId: string, userId: string): Promise<{ success: boolean; message: string }>;
  downvote(topicId: string, userId: string): Promise<{ success: boolean; message: string }>;
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
      userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      name: { type: String, required: true },
      email: { type: String },
    },

    // Voting
    upvotes: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    downvotes: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },

    // commentsCount: { type: Number, default: 0 },
    // viewsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Create a virtual property for net votes (upvotes - downvotes)
topicSchema.virtual("netVotes").get(function () {
  return this.upvotes.count - this.downvotes.count;
});

// Add this to your topicSchema definition
topicSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'topicId',
  options: { sort: { createdAt: -1 } } // Sort by most recent
});

// Virtual property to get a specific user's vote status
topicSchema.methods.getUserVoteStatus = function(userId: string) {
  if (!userId) return 'none';
  
  const upvoted = this.upvotes.users.some(
    (id: mongoose.Types.ObjectId | string) => id.toString() === userId.toString()
  );
  
  if (upvoted) return 'upvoted';
  
  const downvoted = this.downvotes.users.some(
    (id: mongoose.Types.ObjectId | string) => id.toString() === userId.toString()
  );
  
  if (downvoted) return 'downvoted';
  
  return 'none';
};

// Add the implementation for fetching topic with comments
topicSchema.statics.getComments = async function(topicId: string, limit = 10, skip = 0) {
  const topic = await this.findById(topicId);
  if (!topic) return null;
  
  const comments = await mongoose.model('Comment').find({
    topicId,
    parentId: { $exists: false }, // Only top-level comments
    isActive: true
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const topicObj = topic.toObject();
  
  // Remove user lists for privacy
  delete topicObj.upvotes.users;
  delete topicObj.downvotes.users;
  
  // Add computed properties
  topicObj.netVotes = topic.upvotes.count - topic.downvotes.count;
  
  return {
    ...topicObj,
    comments
  };
};

// Add method to count comments for a topic
topicSchema.statics.countComments = async function(topicId: string) {
  return mongoose.model('Comment').countDocuments({
    topicId,
    isActive: true
  });
};

// Comment Schema 
export interface IComment extends Document {
  topicId: mongoose.Types.ObjectId | string;
  content: string;
  //   images?: string[];

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
    // images: [{ type: String }],

    createdBy: {
      userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      name: { type: String, required: true },
      email: { type: String },
    },
    
    // parentId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Comment",
    //   index: true,
    // },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update topic's commentCount
commentSchema.pre("save", async function (next) {
  if (this.isNew) {
    await mongoose
      .model("Topic")
      .updateOne({ _id: this.topicId }, { $inc: { commentsCount: 1 } });
  }
  next();
});

// Methods for handling votes on topics
topicSchema.statics.upvote = async function (topicId: string, userId: string) {
    const topic = await this.findById(topicId);
    if (!topic) return { success: false, message: "Topic not found" };
  
    const alreadyUpvoted = topic.upvotes.users.includes(userId);
    const alreadyDownvoted = topic.downvotes.users.includes(userId);
  
    const updateOperations: any = {};
  
    if (alreadyUpvoted) {
      updateOperations.$pull = { "upvotes.users": userId };
      updateOperations.$inc = { "upvotes.count": -1 };
    } else {
      updateOperations.$addToSet = { "upvotes.users": userId };
      updateOperations.$inc = { "upvotes.count": 1 };
  
      if (alreadyDownvoted) {
        updateOperations.$pull = { "downvotes.users": userId };
        updateOperations.$inc["downvotes.count"] = -1;
      }
    }
  
    await this.findByIdAndUpdate(topicId, updateOperations);
    return { success: true, message: alreadyUpvoted ? "Upvote removed" : "Upvoted successfully" };
  };


topicSchema.statics.downvote = async function (topicId: string, userId: string) {
  const topic = await this.findById(topicId);
  if (!topic) return { success: false, message: "Topic not found" };

  const alreadyDownvoted = topic.downvotes.users.includes(userId);
  const alreadyUpvoted = topic.upvotes.users.includes(userId);

  const updateOperations: any = {};

  if (alreadyDownvoted) {
    updateOperations.$pull = { "downvotes.users": userId };
    updateOperations.$inc = { "downvotes.count": -1 };
  } else {
    updateOperations.$addToSet = { "downvotes.users": userId };
    updateOperations.$inc = { "downvotes.count": 1 };

    if (alreadyUpvoted) {
      updateOperations.$pull = { "upvotes.users": userId };
      updateOperations.$inc["upvotes.count"] = -1;
    }
  }

  await this.findByIdAndUpdate(topicId, updateOperations);
  return { success: true, message: alreadyDownvoted ? "Downvote removed" : "Downvoted successfully" };
};

export const Topic: ITopicModel =
  (mongoose.models.Topic as ITopicModel) || mongoose.model<ITopic, ITopicModel>("Topic", topicSchema);
export const Comment : Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
