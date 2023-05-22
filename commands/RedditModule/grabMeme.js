const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const snoowrap = require('snoowrap');
const appRoot = require('app-root-path');

const { redditClientId, redditClientSecret, redditRefreshToken } = require(appRoot + '/config.json');

const reddit = new snoowrap({
    userAgent: 'electra discord bot',
    clientId: redditClientId,
    clientSecret: redditClientSecret,
    refreshToken: redditRefreshToken,
});

async function getRandomPost(subreddit, getImage, retryCount = 0) {
    try {

        if (reddit.getSubreddit(subreddit).over_18) {
            return {
                isNSFWSubreddit: true,
            };
        }

        if (retryCount < 5) {
            console.log('Post is NSFW, finding another post...');
            return getRandomPost(subreddit, getImage, retryCount + 1);
        }

        const randomPost = await reddit.getRandomSubmission(subreddit);

        if (retryCount >= 5 || randomPost.over_18) {
            console.log('Post is NSFW. Returning NSFW warn.');
            return {
                isNSFW: true,
            };
        }

        if (getImage && randomPost.is_reddit_media_domain) {
            return {
                title: randomPost.title,
                upvotes: randomPost.ups,
                url: randomPost.url,
                author: randomPost.author.name,
                isNSFW: false,
            };
        }

        if (!getImage && randomPost.is_self) {
            return {
                title: randomPost.title,
                upvotes: randomPost.ups,
                body: randomPost.selftext,
                author: randomPost.author.name,
                isNSFW: false,
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
        .setName('meme')
        .setDescription('Returns a random meme from r/memes.'),

    async execute(interaction) {
        global.instanceCommandCount = global.instanceCommandCount + 1;

        await interaction.deferReply();

        const getImage = true;
        const subreddit = 'memes';

        getRandomPost(subreddit, getImage).then(result => {
            if (result.isNSFWSubreddit) {
                const redditErrorEmbed = new EmbedBuilder()
                    .setColor(0xF95d5d)
                    .setTitle('I cannot browse NSFW subreddits.')
                    .setDescription('Unfortunately, I cannot browse NSFW subreddits.')
                    .setTimestamp()
                    .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                interaction.editReply({ embeds: [redditErrorEmbed] });

            } else if (result && result.isNSFW) {
                const redditErrorEmbed = new EmbedBuilder()
                    .setColor(0xF95d5d)
                    .setTitle('I cannot browse NSFW...')
                    .setDescription('Unfortunately, I cannot fetch NSFW posts.')
                    .setTimestamp()
                    .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                interaction.editReply({ embeds: [redditErrorEmbed] });

            } else if (result && getImage) {
                const redditEmbed = new EmbedBuilder()
                    .setColor(0x3FA659)
                    .setTitle(result.title)
                    .setImage(result.url)
                    .addFields({ name: 'Upvotes', value: `${result.upvotes}`, inline: true }, { name: 'Author', value: `u/${result.author}`, inline: true })
                    .setTimestamp()
                    .setFooter({
                        text: `Sent by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                interaction.editReply({ embeds: [redditEmbed] });
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
                .setColor(0xffe838)
                .setTitle('An error occurred.')
                .setDescription('Unfortunately, I cannot fetch posts right now. Try again later?')
                .setTimestamp()
                .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.editReply({ embeds: [redditErrorEmbed] });

            console.log(error);
        });
    },
};
