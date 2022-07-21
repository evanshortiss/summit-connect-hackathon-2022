# Web Terminal Customisation Example

The *Containerfile* in this folder can be used to create a custom image for the
OpenShift Web Terminal `web-terminal-tooling` container.

Currently, this *Containerfile* extends the base Web Terminal tooling image
with Node.js and the ArgoCD CLI, and a customised welcome message in the
*.bashrc*.

## Build & Push

These commands will build the image and push it to a repository on quay.io.

```bash
# Replace the QUAY_USERNAME with the name of an account you can write to
export QUAY_USERNAME=youruser
export IMAGE_NAME=podman push quay.io/youruser/custom-web-terminal:latest

podman login quay.io -u $QUAY_USERNAME

cd web-terminal/

podman build . -t $IMAGE_NAME

podman push $IMAGE_NAME
```

## Usage on with OpenShift Web Terminal

After building and pushing your custom Web Terminal tooling image to a publicly
accessible registry, patch the `web-terminal-tooling` *DevWorkspaceTemplate* to
load your image instead of the default image.

1. Login to the OpenShift cluster as a user with *cluster-admin* permissions.
1. Install the Web Terminal operator by following [the documentation](https://docs.openshift.com/container-platform/4.10/web_console/odc-about-web-terminal.html).
1. Verify that both the Web Terminal and Dev Workspace Operators are in the `Succeeded` phase using the `oc get clusterserviceversion` command.
1. Update the `web-terminal-tooling` *DevWorkspaceTemplate* container image:
    ```bash
    # Make sure change the quay.io URL in the JSON patch object!
    oc patch DevWorkspaceTemplate/web-terminal-tooling --type='json' \
    -p='[{"op": "replace", "path": "/spec/components/0/container/image", "value": "quay.io/youruser/custom-web-terminal:latest"}]' \
    -n openshift-operators
    ```
1. Annotate the *DevWorkspaceTemplate* to prevent the custom image being overwritten by the Web Terminal operator:
    ```bash
    oc annotate devworkspacetemplate web-terminal-tooling \
    'web-terminal.redhat.com/unmanaged-state=true' \
    -n openshift-operators
    ```


Currently running Web Terminal Pods may need to be manually deleted to force
them to load the new image. You can delete old Web Terminal Pods using the
following command:

```bash
# Delete web terminal pods in a given namespace
oc delete pod -l 'controller.devfile.io/devworkspace_id' -n $YOUR_NAMESPACE
```