
const got = require('got');
const ora = require('ora');
const chalk = require('chalk');
const utils = require('./utils');

const spinnerApi = ora('Init Api!');

module.exports = {

    /**
     * For each name, load profile
     * @param {Array} listProfileName
     * @param options
     */
	start(listProfileName, options) {
        this.options = options;
		spinnerApi.start();
		listProfileName.forEach(profileName => {
			got(`https://instagram.com/${profileName}/?__a=1`, {json: true})
                .then(data => this.parseData(profileName, data.body));
		});
	},

	/**
	 * Parse data for each name
	 * @param {String} profileName
	 * @param {Object} data
	 */
	parseData(profileName, data) {
		this.parsedData = {
			alias: data.graphql.user.username,
			username: data.graphql.user.full_name,
			descriptionProfile: data.graphql.user.biography,
			urlProfile: `https://www.instagram.com/${data.graphql.user.username}`,
			urlImgProfile: data.graphql.user.profile_pic_url_hd,
			website: data.graphql.user.external_url,
			numberPosts: data.graphql.user.edge_owner_to_timeline_media.count,
			numberFollowers: data.graphql.user.edge_followed_by.count,
			numberFollowing: data.graphql.user.edge_follow.count,
			private: data.graphql.user.is_private,
			isOfficial: data.graphql.user.is_verified,
			posts: []
		};
/**                console.log(this.parsedData); **/

		let hasNextPage = data.graphql.user.edge_owner_to_timeline_media.page_info.has_next_page;
		let idNextPage = data.graphql.user.edge_owner_to_timeline_media.page_info.end_cursor;
                let userId = data.graphql.user.id;
                /** console.log(idNextPage)
                console.log(userId)
                console.log(`https://instagram.com/${profileName}/?__a=1&max_id=${idNextPage}`)
                console.log(`https://www.instagram.com/graphql/query/?query_hash=472f257a40c653c64c666ce877d59d2b&variables={"id":"${userId}","first":12,"after":"${idNextPage}"}`) **/
               

		function next(that) {
			const self = that;
			if (hasNextPage === false ||  self.parsedData.posts.length > 30) {
				self.createFile();
			} else {
/**                               console.log("123") **/
                               let url = `https://www.instagram.com/graphql/query/?query_hash=472f257a40c653c64c666ce877d59d2b&variables={"id":"${userId}","first":12,"after":"${idNextPage}"}`;
                   /**             console.log(url); **/
				setTimeout(() => {
					got(url, {json: true})
                        .then(request => {
	const newData = request.body;
	spinnerApi.text = `crawl posts with API : ${self.parsedData.posts.length}/${self.parsedData.numberPosts}`;
	hasNextPage = newData.data.user.edge_owner_to_timeline_media.page_info.has_next_page;
	idNextPage = newData.data.user.edge_owner_to_timeline_media.page_info.end_cursor;
        postEdges = newData.data.user.edge_owner_to_timeline_media.edges;
	self.createPosts(newData.data.user.edge_owner_to_timeline_media.edges, next);
});
				}, 1000);
/*** console.log("45678") **/
			}
		}

		if (this.parsedData.private === true) {
			this.createFile();
		} else if (this.parsedData.posts.length < 11) {
		        this.createPosts(data.graphql.user.edge_owner_to_timeline_media.edges, next);
		} else if (this.parsedData.posts.length > 11) {
                        this.createPosts(postEdges,next)
                        
                } else {
                        console.log('test')
                }
                
	},

	/**
	 * Get post for each name
	 * @param {Object} data
	 * @param {Callback} next
	 */
	createPosts(data, next) {
		data.forEach(post => {
                post = post.node;
                if (post.edge_media_to_caption.edges.length !== 0){
			this.parsedData.posts.push({
				url: `https://www.instagram.com/p/${post.shortcode}`,
				urlImage: post.display_url,
				width: post.dimensions.width,
				height: post.dimensions.height,
				numberLikes: post.edge_media_preview_like.count,
				numberComments: post.edge_media_to_comment.count,
				isVideo: post.is_video,
				multipleImage: (post.__typename === 'GraphImage'),
				tags: utils.getTags(post.edge_media_to_caption.edges[0].node.text),
				mentions: utils.getMentions(post.edge_media_to_caption.edges[0].node.text),
				description: post.edge_media_to_caption.edges[0].node.text,
				date: new Date(parseInt(post.taken_at_timestamp) * 1000)
			});
                } else {
                                console.log("null list");
                }
                /**console.log(this.parsedData.posts)**/
		});
		next(this);
	},

	/**
	 * Write file
	 */
	createFile() {
		utils.createFile(this.parsedData, this.options)
            .then(spinnerApi.succeed(chalk.green(`File created with success for profile ${this.parsedData.alias}`)))
            .catch(err => spinnerApi.fail(chalk.red(`Error : ${err.message}`)));
	}
};

