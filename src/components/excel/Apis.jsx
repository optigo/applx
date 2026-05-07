"use client";
import { useCallback } from "react";
import _ from "lodash";
import { ApiService } from "@/services/api";

export default function useExcelApi(headers, loginData) {
    
    const apiService = new ApiService();

    apiService.setBaseData({
        appuserid: loginData?.UserId || "", 
        IPAddress: loginData?.IpAddress || "", 
        domain: loginData?.Domain || ""
    });

    const fetchData = useCallback(async () => {
        console.log("headers", headers);
        apiService.setBaseMode("powerbi_list");
        apiService.setBaseDesc("PowerBi (list)");
        return await apiService.executeApi(headers, {});
    }, [headers]);

    const addData = useCallback(async (body) => {
        apiService.setBaseMode("powerbi_add_data");
        apiService.setBaseDesc("PowerBi (powerbi_add_data)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    const updateData = useCallback(async (body) => {
        apiService.setBaseMode("powerbi_update_data");
        apiService.setBaseDesc("PowerBi (powerbi_update_data)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    const deleteData = useCallback(async (body) => {
        apiService.setBaseMode("powerbi_delete_data");
        apiService.setBaseDesc("PowerBi (powerbi_delete_data)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    const changeStatus = useCallback(async (body) => {
        apiService.setBaseMode("powerbi_change_status");
        apiService.setBaseDesc("PowerBi (powerbi_change_status)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    const changeLiveStatus = useCallback(async (body) => {
        apiService.setBaseMode("change_live_status");
        apiService.setBaseDesc("PowerBi (change_live_status)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    const generateUniqueToken = useCallback(async (body) => {
        apiService.setBaseMode("generate_unique_token");
        apiService.setBaseDesc("PowerBi (generate_unique_token)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    const generatejsonFiles = useCallback(async (body) => {
        apiService.setBaseUrl("api/json-files/" + headers?.version + "/" + headers?.sp + "/" + headers?.yearcode + "/" + headers?.sv);
        apiService.setBaseMode("jsonfile");
        apiService.setBaseDesc("PowerBi (jsonfile)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    return { 
        fetchData, addData, updateData, deleteData, 
        changeStatus, changeLiveStatus, generateUniqueToken,
        generatejsonFiles
    }
}