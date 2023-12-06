import {NetworkManager} from "../framework/utils/networkManager.js";

/**
 * Repository for forum posts
 * @author Marco de Boer
 */
export class forumMessageRepository {

    #route
    #networkManager

    #forumPost

    constructor() {
        this.#route = "/forumpost"
        this.#networkManager = new NetworkManager();
    }

    /**
     * Get forum post by id from the database
     * @param forumPostId - id of the forum post to get
     * @returns {Promise<*>} - the forum post with the given id
     * @author Marco de Boer
     */
    async get(forumPostId) {
        this.#forumPost = await this.#networkManager.doRequest(`${this.#route}?id=${forumPostId}`, "GET")
        return this.#forumPost;
    }

    /**
     * Get all forum posts from the database
     * @param forumPostId - id of the forum post to get
     * @returns {Promise<*>} - the forum post with the given id
     * @author Marco de Boer
     */
    async getComments(forumPostId){
        return this.#forumPost = await this.#networkManager.doRequest(`${this.#route}/comments?id=${forumPostId}`, "GET")
    }

    /**
     * Create a new forum post in the database
     * @param forumPostId - id of the forum post to get
     * @param comment - the comment to add
     * @param parentCommentId - the id of the parent comment
     * @returns {Promise<*>} - json with success or failure message and the id of the new comment if successful
     * @author marco de Boer
     */
    async create(forumPostId, comment, parentCommentId, userId) {
        return this.#forumPost = await this.#networkManager.doRequest(`/createcomment/${forumPostId}`, "POST", {
            comment: comment, parentCommentId: parentCommentId, user: userId
        })
    }

    async delete() {

    }

    async update(id, values = {}) {

    }

}