//const { caller } = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);



async function GPT35Turbo(message) {

    var GPT35TurboMessage = [
        {
          role: "user",
          content: message,
        },
      ];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: GPT35TurboMessage,
    });
  
    return (response.data.choices[0].message.content);
  };

async function ween() {
    let res = await GPT35Turbo("hello")
    console.log(res)
}

ween()