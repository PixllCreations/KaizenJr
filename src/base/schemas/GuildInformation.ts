import { Schema, model, Document } from "mongoose";

/**
 * Interface for the temporary channel document in the database.
 */

interface ITemporaryChannel {
  tempChannelId: string;
  tempChannelName: string;
  creationTime: Date;
  deletionTime: Date | null;
  isEmpty: boolean;
  creatorId: string;
  manualDeletion: boolean;
  deletedBy: string | null;
}

/**
 * Interface for the J2C (Join to Create) channel document in the database.
 */

interface IJ2CChannel {
  j2cChannelId: string;
  j2cChannelName: string;
  tempChannels: ITemporaryChannel[];
}

/**
 * Interface for the guild information document in the database.
 */

export interface IGuildInformation extends Document {
  guildId: string;
  guildName: string;
  j2cChannels: IJ2CChannel[];
  logChannelId: string;
}

// Define the schema for the temporary channel
const temporaryChannelSchema = new Schema<ITemporaryChannel>({
  tempChannelId: { type: String, required: true },
  tempChannelName: { type: String, required: true },
  creationTime: { type: Date, default: Date.now },
  deletionTime: { type: Date, default: null },
  isEmpty: { type: Boolean, default: true },
  creatorId: { type: String, required: true },
  manualDeletion: { type: Boolean, default: false },
  deletedBy: { type: String, default: null },
});

// Define the schema for the J2C channel
const j2cChannelSchema = new Schema<IJ2CChannel>({
  j2cChannelId: { type: String, required: true },
  j2cChannelName: { type: String, required: true },
  tempChannels: [temporaryChannelSchema], // Embed the temporary channel schema
});

// Define the schema for the guild information
const guildInformationSchema = new Schema<IGuildInformation>(
  {
    guildId: { type: String, required: true, unique: true },
    guildName: { type: String, required: true },
    j2cChannels: [j2cChannelSchema], // Embed the J2C channel schema
    logChannelId: { type: String, required: true, unique: true, default: null },
  },
  {
    timestamps: true, // Enable timestamps for automatic creation and update timestamps
  }
);

// Create and export the model based on the guild information schema
export default model<IGuildInformation>(
  "GuildInformation",
  guildInformationSchema
);
