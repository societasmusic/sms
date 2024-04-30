const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        version: {
            type: String,
            required: false
        },
        subItemOf: {
            type: String,
            required: false
        },
        itemType: {
            type: String,
            required: true
        },
        itemNumber: {
            itemNumberSeries: {
                type: String,
                required: false
            },
            itemNumberText: {
                type: String,
                required: false
            },
        },
        itemImage: {
            type: String,
            required: false
        },
        itemLabel: {
            type: String,
            required: false
        },
        cLine: {
            cLineYear: {
                type: String,
                required: false
            },
            cLineText: {
                type: String,
                required: false
            },
        },
        pLine: {
            pLineYear: {
                type: String,
                required: false
            },
            pLineText: {
                type: String,
                required: false
            },
        },
        manufacturedIn: {
            type: String,
            required: false
        },
        explicit: {
            type: String,
            required: false
        },
        lang: {
            type: String,
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

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;