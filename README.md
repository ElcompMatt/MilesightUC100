## Milesight UC100 Payload Converter with History Decoder.
In the UC100 you can set the device to log historical data when the device loses comms, it will then retransmit that data when it comes back on line.

The script will take both current and historical payloads and keep them in a single format to send onwards.

>[!WARNING]
This has only been tested with firmware v1.9 (of the milesight UC100), so test it properly if you are using verions lower than v1.9. 

**[UC100 User Guide](https://resource.milesight.com/milesight/iot/document/uc100-user-guide-en.pdf)**

## UC100 Decoder with history 
This is a JS script to decode the Milesight UC100 modbus device and convert that data as well as historical transmissions into a single format for consumption by a webhook or similar.  

When the JSON payload is received by an end point there are two flags to consider:

**isHistory : bool** - This will tell you if the data is historical data being sent by the UC100. 

**HistoricDate : string** - This is the timestamp of the historic data in Unix seconds. 

**[UC100 Payload Decoder (JS)](https://github.com/ElcompMatt/MilesightUC100/blob/main/UC100WithHistoryDecoder.js)**

It uses the existing Milesight payload decoders and then puts it in a structured format. 

Currently the real time and historical payloads are in two seperate payload formats from the device, the purpose of the decoder is to have both payloads in the same format. 

### Scaling Properties

In the script there are two additional properties for scaling and operating on the register values. Typically this should be done in your end point and performaing the required calculations.

**ScalingValue : int**

This is to set a value to be claculated later.

>[!TIP]
This should be left at 1 if no action is to be taken.

>[!CAUTION]
Hard setting scaling values then changing them later will have an effect on the accuracy of your data store, so please make sure you have the correct value. 

**ScalingChannel : int**

Some modbus devices have a register that either holds a fixed scaling value or scaling value that can change as registers increase in size. 
When you conigure the UC100, you can define the scaling channel address (or the appropriate device), then use that address. This will tell your logic in your end point to take the value from that register and perform a calculation and always use the latest value as defined by the device register. 

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
