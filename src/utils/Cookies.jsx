"use client";
import Cookies from "js-cookie";
import _ from "lodash";

/**
 * CredentialManager handles cookie-based JWT authentication and decoding.
 */
class CredentialManager {
    constructor(cookietoken) {
        this.host = typeof window !== "undefined" ? window.location.hostname : "";
        this.cookigKey = atob(cookietoken);
    }

    /**
     * Checks if the environment is local/dev.
     * @returns {boolean}
     */
    isDevEnvironment() {
        return _.some(["nxtfrontend.web", "localhost"], devHost => _.includes(this.host, devHost));
    }

    /**
     * Retrieves credentials, either from a static fallback or from cookies.
     * @returns {{ iss: string, aud: string, exp: number, uid: string, yc: string, sv: string } | null}
     */
    getCredentials() {
        try {

            if (this.isDevEnvironment()) {
                // return "{\"tkn\": \"OTA2NTQ3MTcwMDUzNTY1MQ==\",\"pid\": 18333,\"IsEmpLogin\": 0,\"IsPower\": 0,\"SpNo\": \"MA==\",\"SpVer\": \"\",\"SV\": \"MA==\",\"LId\": \"NQ==\",\"LUId\": \"YWRtaW5Ab3JhaWwuY28uaW4=\",\"DAU\": \"aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ==\",\"YearCode\": \"e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19\",\"cuVer\": \"djE=\",\"rptapiurl\": \"aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA==\"}"
                return {"tkn": "OTA2NTQ3MTcwMDUzNTY1MQ==","pid": 18333,"IsEmpLogin": 0,"IsPower": 0,"SpNo": "MA==","SpVer": "","SV": "MA==","LId": "NQ==","LUId": "YWRtaW5Ab3JhaWwuY28uaW4=","DAU": "aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ==","YearCode": "e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19","cuVer": "djE=","rptapiurl": "aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA=="}
            }

            const token = Cookies.get(this.cookigKey);
            if (!token) {
                console.error("Authentication token (skey) is missing.");
                return null;
            }

            const decoded = decodeURIComponent(token);
            if (!decoded) {
                console.error("Invalid token content");
                return null;
            }

            return decoded;
        } catch (err) {
            console.error("Invalid credentials:", err.message);
            return null;
        }
    }
}

export default CredentialManager;