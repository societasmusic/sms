const mongoose = require("mongoose");

const entrySchema = mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        },
        rows: [
            {
                account: {
                    type: String,
                    required: true
                },
                debit: {
                    type: Number,
                    required: true
                },
                credit: {
                    type: Number,
                    required: true
                },
            }
        ],
        reference: {
            number: {
                type: String,
                required: false
            },
            date: {
                type: Date,
                required: false
            },
            remark: {
                type: String,
                required: false
            },
            attachment: {
                type: String,
                required: false
            },
        },
        approval: {
            status: {
                type: String,
                required: true
            },
            approvedAt: {
                type: Date,
                required: false
            },
            approvedBy: {
                type: String,
                required: false
            },
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

const Entry = mongoose.model("Entry", entrySchema);

module.exports = Entry;