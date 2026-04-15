const AWS = require('aws-sdk');
require('dotenv').config();

// Log environment for debugging
console.log('AWS Region:', process.env.AWS_REGION);

// Create SES service object directly with configuration
const ses = new AWS.SES({
  apiVersion: '2012-10-17',
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

/**
 * Sends an email using AWS SES
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - HTML email body
 * @returns {Promise} - Promise resolving to SES send result
 */
const sendEmail = async (to, subject, body) => {
  const params = {
    Source: process.env.EMAIL_SENDER,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: body,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    console.log('Sending email with params:', JSON.stringify({
      source: params.Source,
      destination: params.Destination,
      subject: params.Message.Subject.Data
    }));
    
    const result = await ses.sendEmail(params).promise();
    console.log('Email sent successfully:', result.MessageId);
    return result;
  } catch (error) {
    console.error('SES Error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};