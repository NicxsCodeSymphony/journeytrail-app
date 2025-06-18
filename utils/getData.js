import { useState, useEffect } from "react";
import axios from "axios";

export function getData(link) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const url = "https://mobile-api-omega.vercel.app";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${url}/${link}`);
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000); 

    return () => clearInterval(intervalId); 
  }, [link]);

  return { data, error, loading };
}
