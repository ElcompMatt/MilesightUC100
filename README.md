## Milesight UC100 Payload Converter with History Decoder.
In the UC100 you can set the device to log historical data when the device loses comms, it will then retransmit that data when it comes back on line.

**[UC100 User Guide](https://resource.milesight.com/milesight/iot/document/uc100-user-guide-en.pdf)**

### UC100 Decoder with history 
**[UC100 Payload Decoder (JS)](https://github.com/ElcompMatt/MilesightUC100/blob/main/UC100WithHistoryDecoder.js)**

This is a JS script to decode the Milesight UC100 modbus device and convert that data as well as historical transmissions into a single format for consumption by a webhook or similar.  

It uses the existing Milesight payload decoders and then puts it in a structured format. 

Currently the real time and historical is in two seperate payload formats from the device, the prupose of this is to have both real time and history data in the same format. 

### UC100 JSON Model For C####

This is a C# JSON Model to process the data sent in the payload. 

You just need to catch the flags hisotry and timestamp flag in the TTN payload and process as you see fit. 

**[UC100 C# JSON Model](https://github.com/ElcompMatt/MilesightUC100/blob/main/MliesightUC100JsonModel.cs)**

e.g.  
```
public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req)
{
     var ttnPayload = await req.ReadFromJsonAsync<MilesightUC100JsonModel>();

      string? timestamp;
      var decoded = ttnPayload.UplinkMessage?.DecodedPayload;

      if (decoded != null && decoded.IsHistory && decoded.HistoricDate.HasValue)
      {                    
          timestamp = DateTimeOffset.FromUnixTimeSeconds(decoded.HistoricDate.Value).UtcDateTime.ToString("o");
      }
      else
      {
          timestamp = TimestampHelper.TryParseTimestamp(ttnPayload.UplinkMessage?.ReceivedAt.ToString());
      }

     return new OkObjectResult("Ok");
}
```

### UNix Time Helper Class 
**[DateTime Helper Class or Unix Time (C#)](https://github.com/ElcompMatt/MilesightUC100/blob/main/UnixTimeConverter.cs)**

This is a simple converter for converting the Unix seconds timestamp in the payload to standard DateTime string. You can convert it to whatever format you want ater that. 
