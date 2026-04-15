const axios = require('axios');

/**
 * Send SMS using bulksmsgateway.in
 * @param {string} mobileNumber - Mobile number to send SMS to
 * @param {string} message - Message content
 * @returns {Promise<Object>} Response from SMS gateway
 */
const sendSMS = async (mobileNumber, message) => {
    try {
        // bulksmsgateway.in Configuration
        const SMS_API_URL = process.env.SMS_API_URL || 'http://bulksmsgateway.in/sendmessage.php';
        const SMS_USER_ID = process.env.SMS_USER_ID || 'SVN IMAGING PVT LTD';
        const SMS_PASSWORD = process.env.SMS_PASSWORD || 'Imaging@123';
        const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'SRMIST';

        // If credentials are not configured, log and skip SMS
        if (!SMS_USER_ID || !SMS_PASSWORD) {
            console.log('SMS credentials not configured. Skipping SMS send.');
            return { success: false, message: 'SMS credentials not configured' };
        }

        // Clean mobile number (remove any spaces, +, -, etc.)
        const cleanedMobile = mobileNumber.replace(/[^\d]/g, '');

        // Prepare SMS parameters for bulksmsgateway.in
        const params = {
            user: SMS_USER_ID,
            password: SMS_PASSWORD,
            mobile: cleanedMobile,
            sender: SMS_SENDER_ID,
            message: message,
            type: '3', // Unicode type, use '0' for normal text
            template_id: '1107170151381029713' // Optional: Use if you have a template set up
        };

        // Send SMS request
        const response = await axios.get(SMS_API_URL, {
            params: params,
            timeout: 10000 // 10 seconds timeout
        });

        console.log('SMS sent successfully:', { mobileNumber: cleanedMobile, status: response.status, data: response.data });

        // Check if response indicates success
        const responseText = response.data.toString();
        if (responseText.includes('success') || response.status === 200) {
            return {
                success: true,
                message: 'SMS sent successfully',
                data: response.data
            };
        } else {
            return {
                success: false,
                message: 'SMS gateway returned error',
                data: response.data
            };
        }

    } catch (error) {
        console.error('Error sending SMS:', error.message);
        
        return {
            success: false,
            message: 'Failed to send SMS',
            error: error.message
        };
    }
};

module.exports = sendSMS;
