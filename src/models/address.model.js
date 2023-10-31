import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
    pipPoint: {
        type: "Point",
        coordinates: [
            11.5,
            104.9
        ],
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    addressLine: {
        type: String,
        required: true
    }
});

const Address = mongoose.model('Address', addressSchema);
export default Address;