import mongoose from 'mongoose';

const RSVPSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isComing: {
        type: Boolean,
        default: false
    },
    hasResponded: {
        type: Boolean,
        default: false
    },
    invitationRound: {
        type: Number,
        default: 0 // 0: none, 1: first, 2: reminder, 3: final
    },
    invitationStatus: {
        type: String,
        enum: ['not_sent', 'sent'],
        default: 'not_sent'
    },
    guests: {
        type: Number,
        default: 0
    },
    veganCount: {
        type: Number,
        default: 0
    },
    vegCount: {
        type: Number,
        default: 0
    },
    dietary: {
        type: String,
        default: ''
    },
    invitationImageUrl: {
        type: String,
        default: ''
    },
    tableNumber: {
        type: Number,
        default: 0
    },
    shuttle: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.RSVP || mongoose.model('RSVP', RSVPSchema);
