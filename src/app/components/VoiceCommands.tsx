
export default function VoiceCommands({ commandList }: { commandList: string[] }) {

  return (
    <ul>
      {commandList.map((voiceCommand, index) =>
        <li key={index}>{voiceCommand.toString()}</li>
      )}
    </ul>
  );
}