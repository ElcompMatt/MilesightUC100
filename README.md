## Milesight UC100 Payload Converter with History Decoder.
In the UC100 you can set the device to log historical data when the device loses comms, it will then retransmit that data when it comes back on line.

**[UC100 User Guide](https://resource.milesight.com/milesight/iot/document/uc100-user-guide-en.pdf)**

## UC100 Decoder with history 
This is a JS script to decode the Milesight UC100 modbus device and convert that data as well as historical transmissions into a single format for consumption by a webhook or similar.  

**[UC100 Payload Decoder (JS)](https://github.com/ElcompMatt/MilesightUC100/blob/main/UC100WithHistoryDecoder.js)**

It uses the existing Milesight payload decoders and then puts it in a structured format. 

Currently the real time and historical is in two seperate payload formats from the device, the prupose of this is to have both real time and history data in the same format. 

### Scaling Properties

In the script there are two properties for scaling the values in an end point/webhook, not in TTN.

**ScalingValue : int**

This is to set a value to be claculated later.

>[!TIP]
This should be left at 1 if no action is to be taken.

>[!CAUTION]
Hard setting scaling values, then changing them can have an effect on the accuracy of your data store, so please make sure you have the correct value. 

**ScalingChannel : int**

There are times where modbus devices have a register that either holds a fixed scaling value or scaling value that can change value as registers increase in size. 
When you conigure the UC100, you can define the scaling channel address, then use that address. This will tell your logic in the webhook to take the value ffom that register value and perform a calculation. 

>[!TIP]
This should be left at -1 if no action is to be taken.

>[!CAUTION]
Getting this value wrong can result in incorrect data until you change the value, so make sure you are using the correct register. 

## UC100 JSON Model For C

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

## Unix Time Helper Class 
This is a simple converter for converting the Unix seconds timestamp in the payload to standard DateTime string. You can convert it to whatever format you want after that. 

**[DateTime Helper Class or Unix Time (C#)](https://github.com/ElcompMatt/MilesightUC100/blob/main/UnixTimeConverter.cs)**
