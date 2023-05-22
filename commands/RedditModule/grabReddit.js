const colours = require('colors');
colours.enable();

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const snoowrap = require('snoowrap');
const appRoot = require('app-root-path');
var isNSFW;

const { redditClientId, redditClientSecret, redditRefreshToken } = require(appRoot + '/config.json');

const reddit = new snoowrap({
    userAgent: 'electra discord bot',
    clientId: redditClientId,
    clientSecret: redditClientSecret,
    refreshToken: redditRefreshToken,
});

async function getRandomPost(subreddit, getImage, retryCount = 0) {
    try {
        if (retryCount >= 5) {
            console.log('Cannot find non-NSFW post');
            isNSFW == true;
            return null;
        }

        const randomPost = await reddit.getRandomSubmission(subreddit);
  
        if (randomPost.over_18) {
            console.log('Post is NSFW, finding another post...');
            return getRandomPost(subreddit, getImage, retryCount + 1);
        }

        if (getImage && randomPost.is_reddit_media_domain) {
            return {
                title: randomPost.title,
                upvotes: randomPost.ups,
                url: randomPost.url,
                author: randomPost.author.name,
            };
        }
  
        if (!getImage && randomPost.is_self) {
            return {
                title: randomPost.title,
                upvotes: randomPost.ups,
                body: randomPost.selftext,
                author: randomPost.author.name,
            };
        }
  
        return getRandomPost(subreddit, getImage, retryCount);
    } catch (error) {
        console.error('An error occurred:', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reddit')
        .setDescription('Returns a random meme from r/memes.')
        .addStringOption(option =>
            option
                .setName('subreddit')
                .setDescription('The subreddit you\'d like the bot to search.')
                .setRequired(true),
        )
        .addBooleanOption(option =>
            option
                .setName('returnimage')
                .setDescription('Whether you would like the bot to return an image or not.')
                .setRequired(true),
        ),
    async execute(interaction) {
        global.instanceCommandCount = global.instanceCommandCount + 1;

        await interaction.deferReply();

        const getImage = interaction.options.getBoolean('returnimage'); 
        const subreddit = interaction.options.getString('subreddit');

        const isNSFWSubreddit = await reddit.getSubreddit(subreddit).over_18;

        if (isNSFWSubreddit) {
            const redditNSFWEmbed = new EmbedBuilder()
                .setColor(0xF95d5d)
                .setTitle('I cannot fetch NSFW...')
                .addFields('The subreddit you have chosen is NSFW.')
                .setTimestamp()
                .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.editReply({ embeds: [redditNSFWEmbed] });
            isNSFW == false;

            return;
        }

        getRandomPost(subreddit, getImage).then(result => {

            if (isNSFW) {
                const redditNSFWEmbed = new EmbedBuilder()
                    .setColor(0xF95d5d)
                    .setTitle('I cannot fetch NSFW...')
                    .addFields('The subreddit you have chosen contains mostly NSFW content.')
                    .setTimestamp()
                    .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                interaction.editReply({ embeds: [redditNSFWEmbed] });
                isNSFW == false;

                return;
            }
            
            if (result && getImage) {

                const redditEmbed = new EmbedBuilder()
                    .setColor(0x3FA659)
                    .setTitle(result.title)
                    .setImage(result.url)
                    .addFields({ name: 'Upvotes', value: `${result.upvotes}`, inline: true }, { name: 'Author', value: `u/${result.author}`, inline: true })
                    .setTimestamp()
                    .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                interaction.editReply({ embeds: [redditEmbed] });

            } else if (result) {

                const redditTextEmbed = new EmbedBuilder()
                    .setColor(0x3FA659)
                    .setTitle(result.title)
                    .setDescription(result.body)
                    .addFields({ name: 'Upvotes', value: `${result.upvotes}`, inline: true }, { name: 'Author', value: `u/${result.author}`, inline: true })
                    .setTimestamp()
                    .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                interaction.editReply({ embeds: [redditTextEmbed] });

            } else {
                const redditErrorEmbed = new EmbedBuilder()
                    .setColor(0xF95d5d)
                    .setTitle('No suitable posts found...')
                    .setDescription('Unfortunately, there are no suitable posts available.')
                    .setTimestamp()
                    .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                interaction.editReply({ embeds: [redditErrorEmbed] });
            }

        }).catch(error => {
            const redditErrorEmbed = new EmbedBuilder()
                .setColor(0xF95d5d)
                .setTitle('An error occurred.')
                .setDescription('Unfortunately, I cannot fetch posts right now. Try again later.')
                .setTimestamp()
                .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.editReply({ embeds: [redditErrorEmbed] });

            console.log(error);
        });
    },
};
