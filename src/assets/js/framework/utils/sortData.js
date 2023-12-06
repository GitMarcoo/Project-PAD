/**
 * @author Saleeman
 */
export class SortData {
    #type
    #data
    #targetedAtt
    #comments

    constructor(type, data, targetedAtt, comments) {
        this.#type = type;
        this.#data = data;
        this.#targetedAtt = targetedAtt;
        this.#comments = comments;
        return this.#sortBasedOnType();
    }

    /**
     * Sorts data in the collection based on the current type.
     * @returns {Array} The sorted data.
     * @throws {Error} If the type is not valid.
     * @author Saleeman
     */
    #sortBasedOnType(){
        switch (this.#type){
            case "a-z":
                return this.#handleStringSorting();
            case "z-a":
                return this.#handleStringSorting();
            case "old-new":
                return this.#data.sort((a, b) => new Date (a[this.#targetedAtt]) - new Date(b[this.#targetedAtt]));
            case "new-old":
                return this.#data.sort((a, b) => new Date(b[this.#targetedAtt])- new Date (a[this.#targetedAtt]));
            case "least-most":
                return this.#data.sort((a, b) => a[this.#targetedAtt]- b[this.#targetedAtt]);
            case "most-least":
                return this.#data.sort((a, b) => b[this.#targetedAtt]- a[this.#targetedAtt]);
            case "mostComments-least":
                return this.#sortForumMessagesByCommentCount(this.#data, this.#comments);
            case "active-forum":
                return this.#sortForumMessagesByLatestComment(this.#data, this.#comments)
            default:
                throw new Error("Invalid type");
        }
    }

    /**
     * Sorts data in the collection based on the current type, when the targeted attribute contains string values.
     * @returns {Array} The sorted data.
     * @author Saleeman
     */
    #handleStringSorting(){
        const returnValOne = this.#type === "a-z" ? -1 : 1;
        const returnValTwo = this.#type === "a-z" ? 1 : -1;

        return this.#data.sort((a, b) => {
            const aVal = a[this.#targetedAtt] ? a[this.#targetedAtt].toLowerCase() : '';
            const bVal = b[this.#targetedAtt] ? b[this.#targetedAtt].toLowerCase() : '';

            if (aVal < bVal) return returnValOne;
            if (aVal > bVal) return returnValTwo;
            return 0;
        });
    }
    /**
     * Sorts an array of forum messages based on the comment count.
     * This function takes an array of forum messages and an array of forum message comments. It counts the number of comments
     * for each message, sorts the forum messages array in descending order based on the comment count, and returns the sorted array.
     * @param forumMessages - The array of forum messages to be sorted.
     * @param forumMessageComments - The array of forum message comments used for counting the comment for each message.
     * @returns {*} - The sorted array of forum messages based on the comment count.
     */
    #sortForumMessagesByCommentCount(forumMessages, forumMessageComments) {
        const messageCounts = {};

        // Count the number of comments for each message
        forumMessageComments.forEach(comment => {
            const messageId = comment.idforummessage;
            messageCounts[messageId] = (messageCounts[messageId] || 0) + 1;
        });

        // Sort the forumMessages array based on the comment count
        forumMessages.sort((a, b) => {
            const commentCountA = messageCounts[a.idMessage] || 0;
            const commentCountB = messageCounts[b.idMessage] || 0;
            return commentCountB - commentCountA;
        });

        return forumMessages;
    }

    /**
     * Sorts an array of forum messages based on the latest comment date.
     * This function takes an array of forum messages and an array of forum message comments. It finds the latest comment date
     * for each message, sorts the forum messages array in descending order based on the latest comment date and forum message, and returns the sorted array.
     * @param forumMessages - The array of forum messages to be sorted.
     * @param forumMessageComments - The array of forum message comments used for finding the latest comment date for each message.
     * @returns {*} - The sorted array of forum messages based on the latest comment date.
     */
    #sortForumMessagesByLatestComment(forumMessages, forumMessageComments) {
        const messageLatestCommentMap = {};

        // Find the latest comment date for each message
        forumMessageComments.forEach(comment => {
            const messageId = comment.idforummessage;
            const commentDate = new Date(comment.date);

            if (!messageLatestCommentMap[messageId] || commentDate > messageLatestCommentMap[messageId]) {
                messageLatestCommentMap[messageId] = commentDate;
            }
        });

        // Sort the forumMessages array based on the latest comment date
        forumMessages.sort((a, b) => {
            const latestCommentDateA = messageLatestCommentMap[a.idMessage] || new Date(a.date);
            const latestCommentDateB = messageLatestCommentMap[b.idMessage] || new Date(b.date);

            return latestCommentDateB - latestCommentDateA;
        });

        return forumMessages;
    }

}