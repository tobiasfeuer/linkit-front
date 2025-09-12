import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoadingIMG from "../../../../../../assets/Loading/bouncing-circles.svg";
import {
  conversionPercentage,
  pendingFollowUps,
  returnMostCommomCompany,
} from "./Helpers/followUpHelpers";

export default function StatisticsFollowUps() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, isLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        isLoading(true);
        const allFollowUps = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/companyjds`
        );
        setFollowUps(allFollowUps.data);
      } catch (error) {
        Swal.fire({
          title: "Error",
          icon: "error",
          text: "Error fetching followUps data, check server status and/or Airtable",
          confirmButtonColor: "#01A28B"
        });
      } finally {
        isLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex flex-row justify-center pt-10">
        {loading ? (
          <img src={LoadingIMG} width={200} />
        ) : (
          <div className="relative overflow-x-auto flex flex-row gap-7">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    ITEM
                  </th>
                  <th scope="col" className="px-6 py-3">
                    A
                  </th>
                  <th scope="col" className="px-6 py-3">
                    B
                  </th>
                  <th scope="col" className="px-6 py-3">
                    C
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    Cantidad de vacantes
                  </th>
                  <td className="px-6 py-4">
                    {
                      followUps.filter(
                        (fw: any) => fw["Tipo de cliente"] === "A"
                      ).length
                    }
                  </td>
                  <td className="px-6 py-4">
                    {
                      followUps.filter(
                        (fw: any) => fw["Tipo de cliente"] === "B"
                      ).length
                    }
                  </td>
                  <td className="px-6 py-4">
                    {
                      followUps.filter(
                        (fw: any) => fw["Tipo de cliente"] === "C"
                      ).length
                    }
                  </td>
                </tr>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    Empresa líder
                  </th>
                  <td className="px-6 py-4">
                    {returnMostCommomCompany(followUps, "A")}
                  </td>
                  <td className="px-6 py-4">
                    {returnMostCommomCompany(followUps, "B")}
                  </td>
                  <td className="px-6 py-4">
                    {returnMostCommomCompany(followUps, "C")}
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    Conversión %
                  </th>
                  <td className="px-6 py-4">
                    {conversionPercentage(followUps, "A").toFixed(2) + "%"}
                  </td>
                  <td className="px-6 py-4">
                    {conversionPercentage(followUps, "B").toFixed(2) + "%"}
                  </td>
                  <td className="px-6 py-4">
                    {conversionPercentage(followUps, "C").toFixed(2) + "%"}
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    Follow-up pendientes
                  </th>
                  <td className="px-6 py-4">
                    {pendingFollowUps(followUps, "A")}
                  </td>
                  <td className="px-6 py-4">
                    {pendingFollowUps(followUps, "B")}
                  </td>
                  <td className="px-6 py-4">
                    {pendingFollowUps(followUps, "C")}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="font-semibold">
                  Reclutador con mayor cantidad de FollowUps:{" "}
                </h1>
                <p>Pepe</p>
              </div>
              <div>
                <h1 className="font-semibold">
                  País con mayor cantidad de FollowUps:{" "}
                </h1>
                <p>Pepe</p>
              </div>
              <div>
                <h1 className="font-semibold">
                  Mediana de años de experiencia:{" "}
                </h1>
                <p>Pepe</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
