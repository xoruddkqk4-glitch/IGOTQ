import { adminFirestore } from '../firebaseAdmin';
import { RoomInfo } from '@/types/room';
import { StoredMessage } from '@/types/message';
import { encryptText, decryptText } from '../crypto';

export class FirestoreRepo {
  private db = () => adminFirestore();

  async saveRoom(room: RoomInfo): Promise<void> {
    await this.db().collection('rooms').doc(room.id).set({
      id: room.id,
      slug: room.slug,
      title: room.title,
      hostUid: room.hostUid,
      isCloudPersisted: true,
      expiresAt: room.expiresAt,
      createdAt: room.createdAt,
    });
  }

  async saveMessage(roomId: string, message: StoredMessage): Promise<void> {
    const encContent = encryptText(message.content);
    const encNickname = encryptText(message.nickname);

    await this.db()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .doc(message.id)
      .set({
        id: message.id,
        parentId: message.parentId || null,
        nicknameCipher: encNickname.ciphertext,
        nicknameIv: encNickname.iv,
        nicknameTag: encNickname.authTag,
        contentCipher: encContent.ciphertext,
        contentIv: encContent.iv,
        contentTag: encContent.authTag,
        isQuestion: message.isQuestion,
        isHostReply: message.isHostReply,
        status: message.status,
        isRestored: message.isRestored,
        createdAt: message.createdAt,
      });
  }

  async getRoomMessages(roomId: string): Promise<StoredMessage[]> {
    const snapshot = await this.db()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages: StoredMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const content = decryptText(data.contentCipher, data.contentIv, data.contentTag);
      const nickname = decryptText(data.nicknameCipher, data.nicknameIv, data.nicknameTag);

      messages.push({
        id: data.id,
        roomId,
        parentId: data.parentId,
        nickname,
        content,
        isQuestion: data.isQuestion,
        isHostReply: data.isHostReply,
        status: data.status,
        isRestored: data.isRestored,
        createdAt: data.createdAt,
      });
    });

    return messages;
  }

  async getUserRooms(hostUid: string): Promise<RoomInfo[]> {
    const snapshot = await this.db()
      .collection('rooms')
      .where('hostUid', '==', hostUid)
      .orderBy('createdAt', 'desc')
      .get();

    const rooms: RoomInfo[] = [];
    snapshot.forEach((doc) => {
      const d = doc.data();
      rooms.push({
        id: d.id,
        slug: d.slug,
        title: d.title,
        hostUid: d.hostUid,
        isCloudPersisted: true,
        expiresAt: d.expiresAt,
        createdAt: d.createdAt,
      });
    });
    return rooms;
  }

  async deleteRoom(roomId: string): Promise<void> {
    const msgsSnap = await this.db().collection('rooms').doc(roomId).collection('messages').get();
    const batch = this.db().batch();
    msgsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(this.db().collection('rooms').doc(roomId));
    await batch.commit();
  }
}

export const firestoreRepo = new FirestoreRepo();
