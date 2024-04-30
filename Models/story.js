// const mongoose = require("mongoose");

// const Story = new mongoose.Schema(
//     {
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true
//         },
//         slides: [
//             {
//                 heading: {
//                     type: String,
//                     required: true,
//                 },
//                 description: {
//                     type: String,
//                     required: true,
//                 },
//                 imageUrl: {
//                     type: String,
//                     required: true,
//                 },
//                 category: { 
//                     type: String, 
//                     enum: ['food', 'health and fitness', 'travel', 'movie', 'education'], 
//                     required: true 
//                 }
//             },
//         ],
//         bookmarks: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "User",
//                 username: String,
//             },
//         ],
//         likes: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "User",
//                 username: String,
//             },
//         ],
//         totalLikes: {
//             type: Number,
//             default: 0,
//         },
//     },
//     { timestamps: true }
// );

// module.exports = mongoose.model("stories", Story);

const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['food', 'health and fitness', 'travel', 'movie', 'education'],
        required: true
    },
    totalLikes: {
        type: Number,
        default: 0,
    },
    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            username: String,
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            username: String,
        },
    ],
});

const Story = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slides: [SlideSchema],
}, { timestamps: true });

module.exports = mongoose.model("stories", Story);
