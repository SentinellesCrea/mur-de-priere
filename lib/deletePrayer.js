import PrayerRequest from "@/models/PrayerRequest";
import Comment from "@/models/Comment";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export async function deletePrayerById(id) {
  const prayer = await PrayerRequest.findByIdAndDelete(id);
  if (!prayer) return null;

  const conversations = await Conversation.find({ prayerRequestId: prayer._id }).distinct("conversationId");
  await Promise.all([
    Comment.deleteMany({ prayerRequest: prayer._id }),
    Message.deleteMany({ conversationId: { $in: conversations } }),
    Conversation.deleteMany({ prayerRequestId: prayer._id }),
  ]);
  return prayer;
}
