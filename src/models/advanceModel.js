const mongoose = require("mongoose");

const advanceSchema = mongoose.Schema(
    {
        requestor: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        attachment: [
            {
                url: {
                    type: String,
                    required: false
                },
            }
        ],
        type: {
            type: String,
            required: true
        },
        startDate: {
            type: String,
            required: false
        },
        endDate: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: true
        },
        approval: {
            mgrApprovedAt: {
                type: Date,
                required: false
            },
            mgrApprovedBy: {
                type: String,
                required: false
            },
            auditApprovedAt: {
                type: Date,
                required: false
            },
            auditApprovedBy: {
                type: String,
                required: false
            },
        },
        advanceDate: {
            type: Date,
            required: false
        },
        isPaid: {
            type: Boolean,
            required: false
        },
        createdBy: {
            type: String,
            required: true
        },
        updatedBy: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Advance = mongoose.model("Advance", advanceSchema);

module.exports = Advance;