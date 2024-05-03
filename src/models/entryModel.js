const mongoose = require("mongoose");

const entrySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: false
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
                type: String,
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