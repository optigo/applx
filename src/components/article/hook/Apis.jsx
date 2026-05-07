"use client";
import { useCallback } from "react";
import _ from "lodash";
import { ApiService } from "@/services/api";
import { format } from "date-fns";

export default function useArticalMasterApi(headers, loginData) {
    const apiService = new ApiService();
    apiService.setBaseData({
        appuserid: loginData?.UserId || "", 
        IPAddress: loginData?.IpAddress || "", 
        domain: loginData?.Domain || ""
    });

    const fetchData = useCallback(async (body) => {
        apiService.setBaseMode("list");
        apiService.setBaseDesc("Article Master (List)");
        const response = await apiService.executeApi(headers, body);
        if (response.success) {
            const data = response.data.rd.map((item) => ({
                id: item.ArticleId,
                ...item,
                EntryDate: item.EntryDate
                    ? format(new Date(item.EntryDate), "dd MMM yyyy")
                    : "",
            }));
            return { success: true, data: { ArticleData: data, TotalCount: response.data.rd[0]?.TotalCount || 0 } }
        } else {
            return { success: false, message: response.message }
        }
    }, [headers]);

    const masterData = useCallback(async () => {
        apiService.setBaseMode("master_list");
        apiService.setBaseDesc("Article Master (Dropdown List)");
        return await apiService.executeApi(headers, {});
    }, [headers]);

    const Delete = useCallback(async (data) => {
        apiService.setBaseMode("delete");
        apiService.setBaseDesc("Article Master (Delete)");
        return await apiService.executeApi(headers, { ArticleId: data.ArticleId });
    }, [headers]);

    const bulkDelete = useCallback(async (data) => {
        let JsonData = JSON.stringify(
            data.map((item) => {
                return {
                    Id: item
                }
            })
        );
        apiService.setBaseMode("bulkDelete");
        apiService.setBaseDesc("Article Master (Bulk Delete)");
        return await apiService.executeApi(headers, { JsonData });
    }, [headers]);

    const updateStatus = useCallback(async (ArticleId, Status) => {
        apiService.setBaseMode("UpdateStatus");
        apiService.setBaseDesc("Article Master (Change status)");
        return await apiService.executeApi(headers, { ArticleId, Status });
    }, [headers]);

    const viewArticle = useCallback(async (ArticleId) => {
        apiService.setBaseMode("viewArticle");
        apiService.setBaseDesc("Article Master (view Artical)");
        const response = await apiService.executeApi(headers, { ArticleId });
        if (response.success && !_.isEmpty(response?.data)) {
            let tableArray = Object.values(
                response?.data?.rd1?.reduce((acc, item) => (
                    (acc[item.StoneTypeName] ??= { StoneTypeName: item.StoneTypeName, items: [] }).items.push(item), acc
                ), {})
            );
            let imageArray = response?.data?.rd2.map(item => item.ImagePath);

            let articleDetails = {
                details: !_.isEmpty(response?.data?.rd) ? response?.data?.rd[0] : {},
                tables: tableArray,
                images: imageArray,
            };

            return { success: true, data: articleDetails };
        } else {
            return { success: false, message: response.message };
        }
    }, [headers]);

    const Calculation = useCallback(async (data) => {
        apiService.setBaseMode("calculation");
        apiService.setBaseDesc("Article Master (Calculation)");
        return await apiService.executeApi(headers, data);
    }, [headers]);

    const addMRP = useCallback(async (data, mrp) => {
        const JsonData = JSON.stringify(
            data.map((item) => {
                return {
                    Id: item,
                    MRP: mrp
                }
            })
        )
        apiService.setBaseMode("addMRP");
        apiService.setBaseDesc("Article Master (Add MRP)");
        return await apiService.executeApi(headers, { JsonData });
    }, [headers]);

    const AddDiscount = useCallback(async (data, Discount) => {
        let JsonData = JSON.stringify(
            data.map((item) => {
                return {
                    Id: item,
                    Discount
                }
            })
        );
        apiService.setBaseMode("addDiscount");
        apiService.setBaseDesc("Article Master (Add Discount)");
        return await apiService.executeApi(headers, { JsonData });
    }, [headers]);

    const AddHSN = useCallback(async (data, HSNCode) => {
        let JsonData = JSON.stringify(
            data.map((item) => {
                return {
                    Id: item,
                    HSNCode
                }
            })
        );
        apiService.setBaseMode("addHSN");
        apiService.setBaseDesc("Article Master (Add HSN)");
        return await apiService.executeApi(headers, { JsonData });
    }, [headers]);

    const ExcelExport = useCallback(async (body) => {
        apiService.setBaseMode("list");
        apiService.setBaseDesc("Article Master (List)");
        return await apiService.executeApi(headers, body);
    }, [headers]);

    const ShopifyExcelExport = useCallback(async () => {
        apiService.setBaseMode("shopifyExcelExport");
        apiService.setBaseDesc("Article Master (Shopify Excel Data List)");
        return await apiService.executeApi(headers, {});
    }, [headers]);

    const ExcelImport = useCallback(async (data) => {
        apiService.setBaseMode("ExcelImport");
        apiService.setBaseDesc("Article Master (Import Excel Data)");
        return await apiService.executeApi(headers, { JsonData: JSON.stringify(data) });
    }, [headers]);

    const ExcelVerify = useCallback(async () => {
        apiService.setBaseMode("ExcelVerify");
        apiService.setBaseDesc("Article Master (Verify Excel Data)");
        return await apiService.executeApi(headers, {});
    }, [headers]);

    const InsertExcel = useCallback(async () => {
        apiService.setBaseMode("InsertExcel");
        apiService.setBaseDesc("Article Master (Insert Excel Data)");
        return await apiService.executeApi(headers, {});
    }, [headers]);

    const Create = useCallback(async (data) => {
        apiService.setBaseMode("create");
        apiService.setBaseDesc("Article Master (Create)");
        return await apiService.executeApi(headers, data);
    }, [headers]);

    const CombinationList = useCallback(async (data) => {
        apiService.setBaseMode("Combination_list");
        apiService.setBaseDesc("Article Master (Combination List)");
        const response = await apiService.executeApi(headers, data);
        if (response.success) {
            const data = response.data.rd.map((item, index) => ({
                SrNo: index + 1,
                id: item.Id,
                ...item
            })); 
            return { success: true, data } 
        } else {
            return { success: false, message: response.message }
        }
    }, [headers]);

    const BulkChangeStatus = useCallback(async (data) => {
        apiService.setBaseMode("bulkUpdateStatus");
        apiService.setBaseDesc("Article Master ( Bulk Status Update )");
        return await apiService.executeApi(headers, data);
    }, [headers]);

    const BulkAddCombinationData = useCallback(async (data) => {
        apiService.setBaseMode("insertCombinationData");
        apiService.setBaseDesc("Article Master ( Insert Combination Articals )");
        return await apiService.executeApi(headers, data);
    }, [headers]);

    const PendingCombinationData = useCallback(async () => {
        apiService.setBaseMode("insertPendingCombination");
        apiService.setBaseDesc("Article Master ( Pending Combination Articals )");
        return await apiService.executeApi(headers, {});
    }, [headers])

    return { 
        fetchData, masterData, Delete, bulkDelete, updateStatus, 
        viewArticle, Calculation, addMRP, AddDiscount, AddHSN,
        ExcelExport, ShopifyExcelExport, ExcelImport, ExcelVerify,
        InsertExcel, Create, CombinationList, BulkChangeStatus,
        BulkAddCombinationData, PendingCombinationData
    };
}