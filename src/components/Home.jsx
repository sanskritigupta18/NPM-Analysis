import React, { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { IoCloseCircleSharp } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import Chart from "chart.js/auto";
import toast from "react-hot-toast";

function Home(props) {
  const [packageName, setPackageName] = useState("");
  const [downloads, setDownloads] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [packageDetails, setPackageDetails] = useState(null);
  const [activeButton, setActiveButton] = useState(""); // Track active button

  const colors = [
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
  ];

  // New custom color for "All Time"
  const allTimeColor = "rgb(255, 213, 0)"; // Example color

  // Function to fetch data from npm API
  const fetchDownloads = async (type) => {
    if (!packageName) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-64 bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 p-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    NPM Analysis
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter valid package name
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-black text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <IoCloseCircleSharp />
              </button>
            </div>
          </div>
        ),
        { position: "bottom-right" }
      );
      return;
    }

    setLoading(true);
    setError("");
    let url = "";
    const today = new Date().toISOString().split("T")[0];

    switch (type) {
      case "lastWeek":
        url = `https://api.npmjs.org/downloads/range/last-week/${packageName}`;
        break;
      case "lastMonth":
        url = `https://api.npmjs.org/downloads/range/last-month/${packageName}`;
        break;
      case "allTime":
        url = `https://api.npms.io/v2/package/${packageName}`;
        break;
      case "today":
        url = `https://api.npmjs.org/downloads/point/${today}/${packageName}`;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      const response_details = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${packageName}`
      );
      const data_details = await response_details.json();
      let package_details = data_details?.objects[0]?.package;
      console.log(package_details);
      setPackageDetails(package_details);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-64 bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 p-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    NPM Analysis
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Data fetched successfully for {type}!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-black text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <IoCloseCircleSharp />
              </button>
            </div>
          </div>
        ),
        { position: "bottom-right" }
      );

      let downloadCount = 0;
      let chartLabels = [];
      let chartDataPoints = [];

      if (type === "allTime") {
        downloadCount =
          data.collected?.npm?.downloads?.reduce(
            (sum, d) => sum + d.count,
            0
          ) || 0;
      } else if (type === "today") {
        downloadCount = data.downloads || 0;
      } else {
        const downloadsData = data.downloads || [];
        chartLabels = downloadsData.map((item) => item.day);
        chartDataPoints = downloadsData.map((item) => item.downloads);
        downloadCount = chartDataPoints.reduce((sum, value) => sum + value, 0);
      }

      setDownloads(downloadCount);

      setChartData({
        labels: chartLabels.length > 0 ? chartLabels : ["Today"],
        datasets: [
          {
            label: `Downloads (${type})`,
            data:
              chartDataPoints.length > 0 ? chartDataPoints : [downloadCount],
            backgroundColor:
              type === "allTime"
                ? allTimeColor
                : chartLabels.map((_, index) => colors[index % colors.length]),
            borderColor: chartLabels.map((_, index) =>
              colors[index % colors.length].replace("0.6", "1")
            ),
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to fetch downloads", error);
      setError("Failed to fetch downloads. Please try again.");
      setDownloads(0);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return <Line data={chartData} />;
      default:
        return <Bar data={chartData} />;
    }
  };

  return (
    <div className="h-full">
      <div className="bg-white flex-col items-center gap-5 border flex justify-center p-12 h-fit m-4 md:m-12 rounded-xl shadow-lg">
        <form
          className="bg-white shadow-lg border flex justify-between border-black rounded-xl px-2 md:px-5 py-2 h-fit w-fit md:w-[60%]"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            className="focus:outline-none"
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Search package here"
          />
          <button
            onClick={() => fetchDownloads("lastWeek")}
            className="bg-blue-400 hover:bg-blue-500 transition-all ease-in duration-200 px-4 py-2 rounded-xl text-white font-semibold"
          >
            Search
          </button>
        </form>
        <div>
          {packageDetails && (
            <div className="text-center">
              <div className="flex justify-center gap-2 items-center">
                <p>Package Name: {packageDetails?.name}</p>
                <a target="_target" href={packageDetails?.links.npm}>
                  <FaLink />
                </a>
              </div>
              <p>{packageDetails?.description}</p>
              <p>Version: {packageDetails?.version}</p>
            </div>
          )}
        </div>
        <div className="md:flex md:flex-row grid grid-cols-2 gap-5 h-fit">
          <button
            type="button"
            onClick={() => {
              fetchDownloads("today");
              setActiveButton("today");
            }}
            className={`${
              activeButton === "today" ? "bg-blue-700" : "bg-blue-400"
            } hover:bg-blue-500 hover:shadow-lg transition-all ease-in duration-200 px-4 py-2 rounded-xl text-white font-semibold`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              fetchDownloads("lastWeek");
              setActiveButton("lastWeek");
            }}
            className={`${
              activeButton === "lastWeek" ? "bg-blue-700" : "bg-blue-400"
            } hover:bg-blue-500 hover:shadow-lg transition-all ease-in duration-200 px-4 py-2 rounded-xl text-white font-semibold`}
          >
            Last Week
          </button>
          <button
            type="button"
            onClick={() => {
              fetchDownloads("lastMonth");
              setActiveButton("lastMonth");
            }}
            className={`${
              activeButton === "lastMonth" ? "bg-blue-700" : "bg-blue-400"
            } hover:bg-blue-500 hover:shadow-lg transition-all ease-in duration-200 px-4 py-2 rounded-xl text-white font-semibold`}
          >
            Last Month
          </button>
          <button
            type="button"
            onClick={() => {
              fetchDownloads("allTime");
              setActiveButton("allTime");
            }}
            className={`${
              activeButton === "allTime" ? "bg-blue-700" : "bg-blue-400"
            } hover:bg-blue-500 hover:shadow-lg transition-all ease-in duration-200 px-4 py-2 rounded-xl text-white font-semibold`}
          >
            All Time
          </button>
        </div>
        <div className="flex gap-5 my-4">
          <button
            className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition-all ease-in duration-200"
            onClick={() => setChartType("bar")}
          >
            Bar
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition-all ease-in duration-200"
            onClick={() => setChartType("line")}
          >
            Line
          </button>
        </div>
        <div className="text-center">
          {loading && <p className="text-xl font-bold">Loading...</p>}
          {error && <p className="text-xl text-red-500 font-bold">{error}</p>}
          <h2 className="text-2xl font-bold mb-4">Downloads: {downloads}</h2>
          {chartData && (
            <div className="md:w-96 w-64 mx-auto">{renderChart()}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
