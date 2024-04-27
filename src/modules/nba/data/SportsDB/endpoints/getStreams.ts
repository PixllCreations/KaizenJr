import axios from "axios";
import { sportsDbAuth } from "../../../../../config/config";
import streamList from "../../assets/StreamList.json";
import IStreamData from "./interfaces/IStreamData";
import { IStreamListEntry } from "./interfaces/IStreamListEntry";

export async function getStreams(eventId: string): Promise<IStreamListEntry[]> {
  const baseUrl = `https://www.thesportsdb.com/api/v1/json/${sportsDbAuth}`;
  const streamEndpoint = `/lookuptv.php?id=${eventId}`;

  try {
    const response = await axios.get(`${baseUrl}${streamEndpoint}`);
    const channels: IStreamData[] = response.data.tvevent || [];
    console.log(channels);
    return channels.reduce((acc: IStreamListEntry[], channel: IStreamData) => {
      const foundStream = streamList.find(
        (s: IStreamListEntry) => s.name === channel.strChannel
      );
      if (foundStream) {
        acc.push(foundStream);
      }
      return acc;
    }, []);
  } catch (error) {
    console.error("Error fetching streams:", error);
    return [];
  }
}
