"use client";
export class FileApis {
    constructor() {
        this.uploadUrl = "/api/upload";
        this.removeFileUrl = "/api/removefile";
        this.replaceFileUrl = "/api/replacefile";
        this.moveFileUrl = "/api/movefile";

        this.currentMode = "";
        this.currentDescription = "";
    }

    /**
 * Constructs a standardized error object.
 * @param {string} status - HTTP or API status code.
 * @param {string} message - Error message.
 * @returns {Object} - Error object.
 */
    buildError(status, message) {
        return {
            status,
            success: false,
            message,
        };
    }

    /**
     * Uploads a file to the server.
     * @param {FormData} formData - Contains file(s) and metadata.
     * @returns {Promise<Object>} - API response or error.
     */
    async Upload(formData) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${this.uploadUrl}`, {
                method: "POST",
                body: formData,
            });
            return await response.json();
        } catch (error) {
            console.error("File Upload Error:", error);
            return this.buildError("500", error.message);
        }
    }

    /**
     * Removes a file from the server.
     * @param {string} imageUrl - Path or identifier of the file to delete.
     * @returns {Promise<Object>} - API response or error.
     */
    async Remove(imageUrl) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${this.removeFileUrl}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl }),
            });

            return await response.json();
        } catch (error) {
            console.error("File Remove Error:", error);
            return this.buildError("500", error.message);
        }
    }

    async Rename(data) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${this.replaceFileUrl}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            return await response.json();
        } catch (error) {
            console.error("File Rename Error:", error);
            return this.buildError("500", error.message);
        }
    }

    async Move(data) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${this.moveFileUrl}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            return await response.json();
        } catch (error) {
            console.error("File Move Error:", error);
            return this.buildError("500", error.message);
        }
    }
}
