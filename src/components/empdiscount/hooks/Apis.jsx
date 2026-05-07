"use client";
import { useCallback } from "react";
import _ from "lodash";
import { ApiService } from "@/services/api";

export default function useEmpDiscountApi(headers) {
    console.log("headers --------", headers);

    const apiService = new ApiService();

    const fetchData = useCallback(async () => {
        apiService.setBaseMode("list");
        apiService.setBaseDesc("Employee Discount Master (List)");
        const response = await apiService.executeApi(headers, {});
        if (response.success) {
            const data = response.data.rd.map((item, index) => ({
                ...item,
                id: index + 1
            }));
            return { success: true, data }
        } else {
            return { success: false, message: response.message }
        }
    }, [headers]);

    const fetchEmpData = useCallback(async () => {
        apiService.setBaseMode("emp_master_list");
        apiService.setBaseDesc("Employee Discount Master (emp_master_list)");
        const response = await apiService.executeApi(headers, {});
        if (response.success) {
            const empdata = response.data.rd.map((item, index) => ({
                id: item.Id,
                customerCode: item.CustomerCode,
                designation: item.Designation
            }));

            const desidata = response.data.rd1.map(item => ({
                id: item.DesignaitonId,
                designation: item.Designation
            }))
            return { success: true, data: { empdata, desidata } }
        } else {
            return { success: false, message: response.message }
        }
    }, [headers]);

    const bulkDelete = useCallback(async (BulkIds) => {
        apiService.setBaseMode("bulk_delete");
        apiService.setBaseDesc("Employee Discount Master (bulk delete)");
        const response = await apiService.executeApi(headers, { BulkIds });
        return response
    }, [headers]);

    const Delete = useCallback(async (DiscountId) => {
        apiService.setBaseMode("delete");
        apiService.setBaseDesc("Employee Discount Master (delete)");
        const response = await apiService.executeApi(headers, { DiscountId });
        return response
    }, [headers]);

    const Add = useCallback(async (data) => {
        apiService.setBaseMode("create");
        apiService.setBaseDesc("Employee Discount Master (create)");
        const response = await apiService.executeApi(headers, { JsonData: JSON.stringify(data) });
        return response
    }, [headers]);

    const Update = useCallback(async (data) => {
        apiService.setBaseMode("update");
        apiService.setBaseDesc("Employee Discount Master (update)");
        const response = await apiService.executeApi(headers, { DiscountId: data.DiscountId, Discount: data.Discount });
        return response
    }, [headers]);

    return { fetchData, fetchEmpData, Delete, bulkDelete, Add, Update }
}