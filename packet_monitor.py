# packet_monitor.py

import scapy.all as scapy
import pickle
import sys
import requests

# Local MAC prefixes (expand this)
mac_vendors = {
    "00-1A-79": "Apple",
    "3C-22-FB": "Dell",
    "D4-F5-13": "Samsung",
    "F8-27-93": "Sony"
}

def load_model_components():
    try:
        with open('model.pkl', 'rb') as f:
            clf = pickle.load(f)
        with open('scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        with open('pca.pkl', 'rb') as f:
            pca = pickle.load(f)
        return clf, scaler, pca
    except FileNotFoundError as e:
        print(f"Error Loading .pkl Files: {e}")
        sys.exit(1)

def get_mac_vendor(mac):
    """Extract the vendor from the MAC address."""
    prefix = mac[:8].upper().replace(':', '-')
    return mac_vendors.get(prefix, "Unknown Vendor")

def extract_hostname(packet):
    """Extract hostname from DHCP packets."""
    if packet.haslayer(scapy.DHCP):
        options = packet[scapy.DHCP].options
        for opt in options:
            if opt[0] == 'hostname':
                return opt[1].decode()
    return None

def extract_user_agent(packet):
    """Extract User-Agent from HTTP packets."""
    if packet.haslayer(scapy.Raw):
        payload = packet[scapy.Raw].load.decode('utf-8', errors='ignore')
        if "User-Agent" in payload:
            start = payload.find("User-Agent:") + 12
            end = payload.find("\r\n", start)
            return payload[start:end]
    return None

def label_device(mac, hostname, user_agent):
    """Label the device based on MAC, hostname, and User-Agent."""
    vendor = get_mac_vendor(mac)

    if hostname and "iPhone" in hostname:
        return "iPhone"
    elif hostname and "Mac" in hostname:
        return "MacBook"
    elif vendor == "Dell":
        return "Dell PC"
    elif user_agent:
        if "iPhone" in user_agent:
            return "iPhone"
        elif "Macintosh" in user_agent:
            return "MacBook"
        elif "Windows NT" in user_agent:
            return "Windows PC"

    return f"Unknown Device ({vendor})"

def packet_callback(packet, clf, scaler, pca):
    if packet.haslayer(scapy.Ether):
        try:
            # Extract information from the packet
            mac_address = packet[scapy.Ether].src
            hostname = extract_hostname(packet)
            user_agent = extract_user_agent(packet)

            # Label the device
            device_label = label_device(mac_address, hostname, user_agent)
            print(f"Detected Device: {device_label} (MAC: {mac_address})")

            # Extract basic features for ML model
            flow_duration = packet.time
            protocol = packet[scapy.IP].proto if packet.haslayer(scapy.IP) else 0
            header_length = len(packet)

            # Prepare the feature vector
            features = [flow_duration, header_length, protocol]
            features_scaled = scaler.transform([features])
            features_pca = pca.transform(features_scaled)

            # Predict using the model
            attack_label = clf.predict(features_pca)[0]
            print(f"Detected Attack: {attack_label}")

            if attack_label != 'BenignTraffic':
                print("Intrusion Detected!")

        except Exception as e:
            print(f"Error Processing Packet: {e}")

def list_network_interfaces():
    try:
        interfaces = scapy.ifaces.data.values()
        print("Available Network Interfaces:")
        for idx, iface in enumerate(interfaces):
            print(f"{idx}: {iface.name} - {iface.description}")
        return list(interfaces)
    except Exception as e:
        print(f"Error Listing Interfaces: {e}")
        return []

def select_interface():
    interfaces = list_network_interfaces()
    while True:
        user_input = input("Select The Interface Number To Monitor: ").strip()
        if user_input.isdigit():
            choice = int(user_input)
            if 0 <= choice < len(interfaces):
                selected_iface = interfaces[choice].name
                print(f"Selected Interface: {selected_iface}")
                return selected_iface
            else:
                print(f"Please enter a number between 0 and {len(interfaces) - 1}.")
        else:
            print("Invalid Input! Please enter a valid number.")

def start_packet_monitoring():
    clf, scaler, pca = load_model_components()
    selected_iface = select_interface()

    print(f"Starting Packet Sniffing On Interface: {selected_iface}")
    try:
        scapy.sniff(iface=selected_iface, prn=lambda pkt: packet_callback(pkt, clf, scaler, pca))
    except PermissionError:
        print("Permission Denied. Non-Admin Access Not Allowed.")
    except Exception as e:
        print(f"Packet Error: {e}")

if __name__ == "__main__":
    start_packet_monitoring()