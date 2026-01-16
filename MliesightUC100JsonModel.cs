using System.Text.Json.Serialization;

namespace YourNameSpace
{
    public class MilesightUC100JsonModel
    {
        [JsonPropertyName("end_device_ids")]
        public EndDeviceIds EndDeviceIds { get; set; }

        [JsonPropertyName("correlation_ids")]
        public List<string> CorrelationIds { get; set; }

        [JsonPropertyName("received_at")]
        public string ReceivedAt { get; set; }

        [JsonPropertyName("uplink_message")]
        public UplinkMessage UplinkMessage { get; set; }
    }

    public class EndDeviceIds
    {
        [JsonPropertyName("device_id")]
        public string DeviceId { get; set; }

        [JsonPropertyName("application_ids")]
        public ApplicationIds ApplicationIds { get; set; }

        [JsonPropertyName("dev_eui")]
        public string DevEui { get; set; }

        [JsonPropertyName("join_eui")]
        public string JoinEui { get; set; }

        [JsonPropertyName("dev_addr")]
        public string DevAddr { get; set; }
    }

    public class ApplicationIds
    {
        [JsonPropertyName("application_id")]
        public string ApplicationId { get; set; }
    }

    public class UplinkMessage
    {
        [JsonPropertyName("session_key_id")]
        public string SessionKeyId { get; set; }

        [JsonPropertyName("f_port")]
        public int FPort { get; set; }

        [JsonPropertyName("f_cnt")]
        public int FCnt { get; set; }

        [JsonPropertyName("frm_payload")]
        public string FrmPayload { get; set; }

        [JsonPropertyName("decoded_payload")]
        public DecodedPayload DecodedPayload { get; set; }

        [JsonPropertyName("rx_metadata")]
        public List<RxMetadata> RxMetadata { get; set; }

        [JsonPropertyName("settings")]
        public Settings Settings { get; set; }

        [JsonPropertyName("received_at")]
        public string ReceivedAt { get; set; }

        [JsonPropertyName("consumed_airtime")]
        public string ConsumedAirtime { get; set; }

        [JsonPropertyName("version_ids")]
        public VersionIds VersionIds { get; set; }

        [JsonPropertyName("network_ids")]
        public NetworkIds NetworkIds { get; set; }
    }

    public class DecodedPayload
    {
        [JsonPropertyName("isHistory")]
        public bool IsHistory { get; set; }

        [JsonPropertyName("HistoricDate")]
        public long? HistoricDate { get; set; }

        [JsonPropertyName("dexmaSettings")]
        public DexmaSettings DexmaSettings { get; set; }

        [JsonPropertyName("res")]
        public List<ResItem> Res { get; set; }
    }

    public class DexmaSettings
    {
        [JsonPropertyName("GatewayKey")]
        public string GatewayKey { get; set; }

        [JsonPropertyName("GatewayToken")]
        public string GatewayToken { get; set; }
    }

    public class ResItem
    {
        [JsonPropertyName("ChannelId")]
        public int ChannelId { get; set; }

        [JsonPropertyName("ParameterCode")]
        public int ParameterCode { get; set; }

        [JsonPropertyName("Value")]
        public double? Value { get; set; }

        [JsonPropertyName("ScalingValue")]
        public double? ScalingValue { get; set; }

        [JsonPropertyName("ScalingChannel")]
        public double? ScalingChannel { get; set; }
    }

    public class RxMetadata
    {
        [JsonPropertyName("gateway_ids")]
        public GatewayIds GatewayIds { get; set; }

        [JsonPropertyName("time")]
        public string Time { get; set; }

        [JsonPropertyName("timestamp")]
        public long Timestamp { get; set; }

        [JsonPropertyName("rssi")]
        public int Rssi { get; set; }

        [JsonPropertyName("channel_rssi")]
        public int ChannelRssi { get; set; }

        [JsonPropertyName("snr")]
        public double Snr { get; set; }

        [JsonPropertyName("frequency_offset")]
        public string FrequencyOffset { get; set; }

        [JsonPropertyName("uplink_token")]
        public string UplinkToken { get; set; }

        [JsonPropertyName("channel_index")]
        public int ChannelIndex { get; set; }

        [JsonPropertyName("gps_time")]
        public string GpsTime { get; set; }

        [JsonPropertyName("received_at")]
        public string ReceivedAt { get; set; }
    }

    public class GatewayIds
    {
        [JsonPropertyName("gateway_id")]
        public string GatewayId { get; set; }

        [JsonPropertyName("eui")]
        public string Eui { get; set; }
    }

    public class Settings
    {
        [JsonPropertyName("data_rate")]
        public DataRate DataRate { get; set; }

        [JsonPropertyName("frequency")]
        public string Frequency { get; set; }

        [JsonPropertyName("timestamp")]
        public long Timestamp { get; set; }

        [JsonPropertyName("time")]
        public string Time { get; set; }
    }

    public class DataRate
    {
        [JsonPropertyName("lora")]
        public Lora Lora { get; set; }
    }

    public class Lora
    {
        [JsonPropertyName("bandwidth")]
        public int Bandwidth { get; set; }

        [JsonPropertyName("spreading_factor")]
        public int SpreadingFactor { get; set; }

        [JsonPropertyName("coding_rate")]
        public string CodingRate { get; set; }
    }

    public class VersionIds
    {
        [JsonPropertyName("brand_id")]
        public string BrandId { get; set; }

        [JsonPropertyName("model_id")]
        public string ModelId { get; set; }

        [JsonPropertyName("hardware_version")]
        public string HardwareVersion { get; set; }

        [JsonPropertyName("firmware_version")]
        public string FirmwareVersion { get; set; }

        [JsonPropertyName("band_id")]
        public string BandId { get; set; }
    }

    public class NetworkIds
    {
        [JsonPropertyName("net_id")]
        public string NetId { get; set; }

        [JsonPropertyName("ns_id")]
        public string NsId { get; set; }

        [JsonPropertyName("tenant_id")]
        public string TenantId { get; set; }

        [JsonPropertyName("cluster_id")]
        public string ClusterId { get; set; }

        [JsonPropertyName("cluster_address")]
        public string ClusterAddress { get; set; }

        [JsonPropertyName("tenant_address")]
        public string TenantAddress { get; set; }
    }
}
