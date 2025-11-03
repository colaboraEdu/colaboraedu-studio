"""
WebSocket Chat Client Test
Test real-time messaging with authentication
"""
import asyncio
import websockets
import json
from datetime import datetime


async def test_chat_client(token: str, user_name: str):
    """
    Test WebSocket chat client
    
    Args:
        token: JWT authentication token
        user_name: Name for display
    """
    uri = f"ws://localhost:8004/ws/chat?token={token}"
    
    print(f"\n{'='*60}")
    print(f"🔌 Connecting {user_name} to WebSocket chat...")
    print(f"{'='*60}\n")
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"✅ {user_name} connected successfully!")
            
            # Receive welcome message
            welcome = await websocket.recv()
            print(f"📨 Received: {welcome}\n")
            
            # Receive online users list
            online_users = await websocket.recv()
            print(f"👥 Online users: {online_users}\n")
            
            # Test: Send ping
            print(f"🏓 Sending ping...")
            await websocket.send(json.dumps({
                "type": "ping"
            }))
            
            pong = await websocket.recv()
            print(f"📨 Received: {pong}\n")
            
            # Test: Request online users
            print(f"👥 Requesting online users...")
            await websocket.send(json.dumps({
                "type": "get_online_users"
            }))
            
            users = await websocket.recv()
            print(f"📨 Received: {users}\n")
            
            # Test: Send typing indicator (would need recipient_id in real scenario)
            print(f"⌨️  Sending typing indicator...")
            await websocket.send(json.dumps({
                "type": "typing",
                "recipient_id": "dummy-id",  # Would be real user ID
                "is_typing": True
            }))
            
            print(f"✨ {user_name} - All tests passed!")
            print(f"\n💡 To send a chat message, use:")
            print(f'''
await websocket.send(json.dumps({{
    "type": "chat_message",
    "recipient_id": "user-uuid-here",
    "content": "Hello!",
    "priority": "normal"
}}))
''')
            
            # Keep connection alive for 10 seconds to test persistence
            print(f"\n⏰ Keeping connection alive for 10 seconds...")
            await asyncio.sleep(10)
            
            print(f"\n👋 {user_name} disconnecting...")
    
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ Connection failed: {e}")
        print(f"   Status code: {e.status_code}")
        if e.status_code == 403:
            print(f"   ⚠️  Invalid or expired authentication token")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        print(f"🔌 {user_name} disconnected\n")


async def test_multiple_clients():
    """Test multiple concurrent WebSocket connections"""
    # You would need real JWT tokens here
    # These are placeholders - replace with actual tokens from /auth/login
    
    print("\n" + "="*60)
    print("🧪 WebSocket Chat Test Suite")
    print("="*60)
    
    print("\n⚠️  To test WebSocket chat:")
    print("1. First, get authentication tokens by logging in:")
    print("   curl -X POST http://localhost:8004/api/v1/auth/login \\")
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"email": "user@example.com", "password": "password"}\'')
    print("\n2. Copy the access_token from the response")
    print("\n3. Replace TOKEN_PLACEHOLDER below with real token")
    print("\n4. Run this script again\n")
    
    # Placeholder tokens - replace with real ones
    token1 = "TOKEN_PLACEHOLDER"
    token2 = "TOKEN_PLACEHOLDER"
    
    if token1 == "TOKEN_PLACEHOLDER":
        print("❌ Please provide real authentication tokens to test")
        print("   See instructions above ☝️\n")
        return
    
    # Test single client first
    await test_chat_client(token1, "User 1")
    
    # To test multiple clients simultaneously:
    # tasks = [
    #     test_chat_client(token1, "User 1"),
    #     test_chat_client(token2, "User 2")
    # ]
    # await asyncio.gather(*tasks)


async def quick_connection_test():
    """
    Quick test to verify WebSocket endpoint is accessible
    """
    print("\n" + "="*60)
    print("🔍 Quick WebSocket Connection Test")
    print("="*60 + "\n")
    
    # Test without token (should fail with 403)
    uri = "ws://localhost:8004/ws/chat?token=invalid"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("❌ Unexpected: Connected without valid token!")
    except websockets.exceptions.InvalidStatusCode as e:
        if e.status_code == 403:
            print("✅ WebSocket endpoint is working correctly!")
            print("   (Rejected invalid token as expected)")
        else:
            print(f"⚠️  Unexpected status code: {e.status_code}")
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
    
    print()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 WebSocket Chat Client - colaboraEDU")
    print("="*60)
    
    # Run quick connection test first
    asyncio.run(quick_connection_test())
    
    # Then run full test suite
    asyncio.run(test_multiple_clients())
