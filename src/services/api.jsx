"use client";
import _ from "lodash";

export class ApiService {
    constructor() {
        this.baseUrl = "api/report";

        this.currentMode = "";                  // Mode identifier for backend operations
        this.currentDescription = "";           // Description of the operation
        this.baseData = {};                // User id of the operation
    }

    /**
     * Sets a new base URL for the API.
     * @param {string} baseUrl - The new base URL.
     */
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Sets the current mode used in API operations.
     * @param {string} mode - Mode string (e.g., 'create', 'update').
     */
    setBaseMode(mode) {
        this.currentMode = mode;
    }

    /**
     * Sets the description of the operation.
     * @param {string} desc - Operation description.
     */
    setBaseDesc(desc) {
        this.currentDescription = desc;
    }

    /**
 * Sets the current user id used in API operations.
 * @param {string} userid - Mode string (e.g., 'create', 'update').
 */
    setBaseData(data = {}) {
        this.baseData = data;
    }

    /**
     * Parses and validates the API response.
     * @param {Response} response - The fetch response object.
     * @returns {Promise<Object>} - Standardized success or error object.
     */
    async parseResponse(response) {
        if (!response.ok) {
            return this.buildError("400", `HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const status = data?.Status || "400";
        const result = data?.Data?.rd?.[0] || {};

        if (status !== "200") {
            return this.buildError(status, `API Error: ${data.Message || "Unknown error"}`);
        }

        if (result?.stat === 0) {
            return this.buildError(status, result.stat_msg || "Operation failed");
        }

        return {
            status,
            success: true,
            data: data.Data,
            message: result.stat_msg || "",
        };
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
     * Sends a POST request to the report API with headers and JSON body.
     * @param {Object} body - Request body payload.
     * @returns {Promise<Object>} - Standardized API response.
     */
    async sendRequest(headers, body) {
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${this.baseUrl}`, {
                method: "POST",
                headers: headers,
                body: !_.isEmpty(body) ? JSON.stringify(body) : "",
            });
            return await this.parseResponse(response);
        } catch (error) {
            console.error("Api Request Error:", error);
            return this.buildError("500", error.message);
        }
    }

    /**
     * Generates a dynamic request payload used for backend operations.
     * @param {string} mode - Backend operation mode.
     * @param {string} description - Operation description.
     * @param {Object} data - Optional additional data.
     * @returns {Object} - Formatted payload.
     */
    generatePayload(mode, description, connData = {}, data = {}) {
        let resp = {
            con: JSON.stringify({
                id: "",
                mode,
                ...connData
            }),
            p: Object.keys(data).length > 0 ? JSON.stringify(data) : "",
            f: description,
        };
        return resp
    }

    /**
     * Executes an API request using the current mode and description.
     * @param {Object} body - Optional request payload.
     * @returns {Promise<Object>} - Standardized response.
     */
    executeApi(headers = {}, body = {}) {
        if (_.isEmpty(this.currentMode) || _.isEmpty(this.currentDescription)) {
            return this.buildError("404", "Invalid Operation: Mode or Description missing");
        }

        return this.sendRequest(headers, this.generatePayload(this.currentMode, this.currentDescription, this.baseData, body));
    }
}